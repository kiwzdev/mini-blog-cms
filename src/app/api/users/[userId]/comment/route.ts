// app/api/users/[userId]/comment/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { IComment } from "@/types/blog";

type ParamsType = Promise<{ userId: string }>;

// POST /api/users/[userId]/comment - Comment
export async function POST(
  request: NextRequest,
  { params }: { params: ParamsType }
) {
  try {
    const { userId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse({
        code: "UNAUTHORIZED",
        message: "Please login to comment",
        status: 401,
      });
    }

    const body = await request.json();
    const { content } = body; // เอา blogId ออก

    if (!content) {
      return createErrorResponse({
        code: "MISSING_FIELDS",
        message: "Content is required",
        status: 400,
      });
    }

    // Check if user exists (แทน blog check)
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!targetUser) {
      return createErrorResponse({
        code: "USER_NOT_FOUND",
        message: "User not found",
        status: 404,
      });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: session.user.id,
        userId: userId,
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
            likes: true,
          },
        },
        likes: {
          where: { userId: session.user.id },
          select: { id: true },
        },
      },
    });

    const responseData: IComment = {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      isLiked: comment.likes.length > 0,
      author: comment.author,
      _count: {
        likes: comment._count.likes,
      },
    };

    return createSuccessResponse({
      data: responseData,
      message: "Comment created successfully",
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return createErrorResponse({
      code: "CREATE_COMMENT_ERROR",
      message: "Error creating comment",
      status: 500,
    });
  }
}
