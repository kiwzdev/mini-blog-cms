import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";
import { ICreateBlogInput } from "@/types/user";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";

// GET /api/posts - Get all posts with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

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
        // ดึงข้อมูล likes เสมอเพื่อตรวจสอบ isLiked
        likes: session?.user?.id
          ? {
              where: {
                userId: session.user.id,
              },
              select: {
                id: true,
              },
            }
          : false,
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

    // เพิ่ม isLiked ให้กับแต่ละ post
    const postsWithLikeStatus = posts.map((post) => ({
      ...post,
      isLiked: session?.user?.id ? post.likes.length > 0 : false,
      likes: undefined, // ลบ likes array ออกเพื่อไม่ให้ response ใหญ่เกินไป
    }));

    const total = await prisma.post.count({ where: whereClause });

    return createSuccessResponse({
      data: {
        posts: postsWithLikeStatus,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: "Posts fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return createErrorResponse({
      code: "FETCH_POSTS_ERROR",
      message: "Failed to fetch posts",
    });
  }
}

// POST /api/posts - Create new post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return createErrorResponse({
        code: "UNAUTHORIZED",
        message: "You must be logged in to create a post",
        status: 401,
      });
    }

    const body: ICreateBlogInput = await request.json();
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
        authorId: session?.user.id,
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

    return createSuccessResponse({
      data: post,
      message: "Post created successfully",
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return createErrorResponse({
      code: "CREATE_POST_ERROR",
      message: "Failed to create post",
    });
  }
}
