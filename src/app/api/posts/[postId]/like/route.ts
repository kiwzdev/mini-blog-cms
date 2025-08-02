import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

type ParamsType = Promise<{ postId: string }>;

// POST /api/posts/[postId]/like - Toggle like on post
export async function POST(
  request: NextRequest,
  { params }: { params: ParamsType }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse({
        code: "UNAUTHORIZED",
        message: "You must be logged in to like posts",
        status: 401,
      });
    }

    const { postId } = await params;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return createErrorResponse({
        code: "POST_NOT_FOUND",
        message: "Post not found",
        status: 404,
      });
    }

    // Check if user already liked the post
    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId: postId,
          userId: session.user.id,
        },
      },
    });

    if (existingLike) {
      // Unlike the post
      await prisma.postLike.delete({
        where: {
          id: existingLike.id,
        },
      });

      return createSuccessResponse({
        data: { liked: false },
        message: "Post unliked successfully",
      });
    } else {
      // Like the post
      await prisma.postLike.create({
        data: {
          postId: postId,
          userId: session.user.id,
        },
      });

      return createSuccessResponse({
        data: { liked: true },
        message: "Post liked successfully",
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
