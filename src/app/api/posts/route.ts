import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";
import { ICreatePostInput } from "@/types";

// GET /api/posts - Get all posts with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const includeDetails = searchParams.get("includeDetails") === "true";

    const skip = (page - 1) * limit;

    const whereClause = {
      published: true,
      ...(userId && { authorId: userId }),
    };

    const posts = await prisma.post.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            username: true,
          },
        },
        ...(includeDetails && {
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        }),
      },
    });

    const total = await prisma.post.count({ where: whereClause });

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create new post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body:ICreatePostInput = await request.json();
    const {
      title,
      content,
      contentType,
      excerpt,
      slug,
      coverImage,
      published,
      category,
    } = body;

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        contentType,
        excerpt,
        coverImage,
        published,
        category,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            username: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}