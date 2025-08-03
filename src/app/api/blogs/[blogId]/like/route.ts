import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

type ParamsType = Promise<{ blogId: string }>;

// POST /api/blogs/[blogId]/like - Toggle like on blog
export async function POST(
  request: NextRequest,
  { params }: { params: ParamsType }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse({
        code: "UNAUTHORIZED",
        message: "You must be logged in to like blogs",
        status: 401,
      });
    }

    const { blogId } = await params;

    // Check if blog exists
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      return createErrorResponse({
        code: "BLOG_NOT_FOUND",
        message: "Blog not found",
        status: 404,
      });
    }

    // Check if user already liked the blog
    const existingLike = await prisma.blogLike.findUnique({
      where: {
        blogId_userId: {
          blogId: blogId,
          userId: session.user.id,
        },
      },
    });

    if (existingLike) {
      // Unlike the blog
      await prisma.blogLike.delete({
        where: {
          id: existingLike.id,
        },
      });

      return createSuccessResponse({
        data: { liked: false },
        message: "Blog unliked successfully",
      });
    } else {
      // Like the blog
      await prisma.blogLike.create({
        data: {
          blogId: blogId,
          userId: session.user.id,
        },
      });

      return createSuccessResponse({
        data: { liked: true },
        message: "Blog liked successfully",
      });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return createErrorResponse({
      code: "TOGGLE_LIKE_ERROR",
      message: "Error toggling like",
      status: 500,
    });
  }
}
