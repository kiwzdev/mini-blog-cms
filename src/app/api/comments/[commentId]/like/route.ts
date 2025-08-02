import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

type ParamsType = Promise<{ commentId: string }>;

// POST /api/comments/[commentId]/like - Toggle like on comment
export async function POST(
  request: NextRequest,
  { params }: { params: ParamsType }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse({
        code: "UNAUTHORIZED",
        message: "You must be logged in to like comments",
        status: 401,
      });
    }

    const { commentId } = await params;

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return createErrorResponse({
        code: "COMMENT_NOT_FOUND",
        message: "Comment not found",
        status: 404,
      });
    }

    // Check if user already liked the comment
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId: commentId,
          userId: session.user.id,
        },
      },
    });

    if (existingLike) {
      // Unlike the comment
      await prisma.commentLike.delete({
        where: {
          id: existingLike.id,
        },
      });

      return createSuccessResponse({
        data: { liked: false },
        message: "Comment unliked successfully",
      });
    } else {
      // Like the comment
      await prisma.commentLike.create({
        data: {
          commentId: commentId,
          userId: session.user.id,
        },
      });

      return createSuccessResponse({
        data: { liked: true },
        message: "Comment liked successfully",
      });
    }
  } catch (error) {
    console.error("Error toggling comment like:", error);
    return createErrorResponse({
      code: "TOGGLE_COMMENT_LIKE_ERROR",
      message: "Error toggling comment like",
      status: 500,
    });
  }
}
