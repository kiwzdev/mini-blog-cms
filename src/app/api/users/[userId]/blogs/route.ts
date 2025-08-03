// app/api/users/[userId]/blogs/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { IBlogCard } from "@/types/blog";

type ParamsType = Promise<{ userId: string }>;

// GET /api/users/[userId]/blogs - ดึง blog พร้อม pagination
export async function GET(
  request: NextRequest,
  { params }: { params: ParamsType }
) {
  try {
    const { userId } = await params;
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      return createErrorResponse({
        code: "USER_NOT_FOUND",
        message: "User not found",
        status: 404,
      });
    }

    const isOwnProfile = session?.user?.id === userId;

    const posts = await prisma.blog.findMany({
      where: {
        authorId: userId,
        // Show only published posts unless it's own profile
        ...(isOwnProfile ? {} : { published: true }),
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
        likes: session?.user?.id
          ? {
              where: { userId: session.user.id },
              select: { id: true },
            }
          : false,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const totalPosts = await prisma.blog.count({
      where: {
        authorId: userId,
        ...(isOwnProfile ? {} : { published: true }),
      },
    });

    const responseData: IBlogCard[] = posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      coverImage: post.coverImage || undefined,
      published: post.published,
      createdAt: post.createdAt,
      category: post.category || undefined,
      isLiked: Array.isArray(post.likes) ? post.likes.length > 0 : false,
      author: {
        id: post.author.id,
        name: post.author.name,
        profileImage: post.author.profileImage || undefined,
        username: post.author.username,
      },
      _count: {
        comments: post._count.comments,
        likes: post._count.likes,
      },
    }));

    return createSuccessResponse({
      data: responseData,
      message: "User blogs fetched successfully",
      meta: {
        page,
        limit,
        total: totalPosts,
        totalPages: Math.ceil(totalPosts / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching user blogs:", error);
    return createErrorResponse({
      code: "FETCH_BLOGS_ERROR",
      message: "Error fetching user blogs",
      status: 500,
    });
  }
}
