import { NextRequest } from "next/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type ParamsType = Promise<{ postId: string }>;

// POST /api/posts/[postId]/comments - Add comment to post
export async function POST(
  request: NextRequest,
  { params }: { params: ParamsType }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse({
        code: "UNAUTHORIZED",
        message: "You must be logged in to comment",
        status: 401,
      });
    }

    const { postId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return createErrorResponse({
        code: "INVALID_CONTENT",
        message: "Comment content is required",
        status: 400,
      });
    }

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

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId: postId,
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
      },
    });

    return createSuccessResponse({
      data: comment,
      message: "Comment added successfully",
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return createErrorResponse({
      code: "ADD_COMMENT_ERROR",
      message: "Error adding comment",
      status: 500,
    });
  }
}
