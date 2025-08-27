import { authOptions } from "@/lib/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

type ParamsType = Promise<{ commentId: string }>;

// POST /api/comments/[commentId]/like - Toggle like on comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<ParamsType> }
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
    const userId = session.user.id;

    // ใช้ transaction เพื่อ consistency และ performance
    const result = await prisma.$transaction(async (tx) => {
      // ตรวจสอบว่า comment มีอยู่และ user like อยู่หรือไม่ในคำสั่งเดียว
      const existingLike = await tx.commentLike.findUnique({
        where: {
          commentId_userId: {
            commentId: commentId,
            userId: userId,
          },
        },
        select: {
          id: true,
          comment: {
            select: {
              id: true, // เอาแค่ id เพื่อ verify ว่า comment มีอยู่
            },
          },
        },
      });

      // ถ้าไม่มี like record แต่ comment ไม่มีอยู่จริง
      if (!existingLike) {
        // ตรวจสอบว่า comment มีอยู่หรือไม่ก่อนสร้าง like
        const commentExists = await tx.comment.findUnique({
          where: { id: commentId },
          select: { id: true }, // เอาแค่ id
        });

        if (!commentExists) {
          throw new Error("COMMENT_NOT_FOUND");
        }

        // สร้าง like ใหม่
        await tx.commentLike.create({
          data: {
            commentId: commentId,
            userId: userId,
          },
        });

        return { liked: true };
      } else {
        // ลบ like ที่มีอยู่
        await tx.commentLike.delete({
          where: {
            id: existingLike.id,
          },
        });

        return { liked: false };
      }
    });

    return createSuccessResponse({
      data: result,
      message: result.liked
        ? "Comment liked successfully"
        : "Comment unliked successfully",
    });
  } catch (error) {
    console.error("Error toggling comment like:", error);

    // Handle specific error cases
    if (error instanceof Error && error.message === "COMMENT_NOT_FOUND") {
      return createErrorResponse({
        code: "COMMENT_NOT_FOUND",
        message: "Comment not found",
        status: 404,
      });
    }

    return createErrorResponse({
      code: "TOGGLE_COMMENT_LIKE_ERROR",
      message: "Error toggling comment like",
      status: 500,
    });
  }
}
