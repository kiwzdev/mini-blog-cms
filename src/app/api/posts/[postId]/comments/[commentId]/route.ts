// app/api/posts/[postId]/comments/[commentId]/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";
import { IComment } from "@/types/blog";

type ParamsType = {
  postId: string;
  commentId: string;
};

// PUT /api/posts/{postId}/comments/{commentId} - Edit a comment
export async function PUT(
  request: NextRequest,
  { params }: { params: ParamsType }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse({
        code: "UNAUTHORIZED",
        message: "You must be logged in to edit comments",
        status: 401,
      });
    }

    const { postId, commentId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return createErrorResponse({
        code: "INVALID_CONTENT",
        message: "Comment content is required",
        status: 400,
      });
    }

    if (content.trim().length > 1000) {
      return createErrorResponse({
        code: "CONTENT_TOO_LONG",
        message: "Comment content must be less than 1000 characters",
        status: 400,
      });
    }

    // Check if comment exists and belongs to the post
    const existingComment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        postId: postId,
      },
    });

    if (!existingComment) {
      return createErrorResponse({
        code: "COMMENT_NOT_FOUND",
        message: "Comment not found",
        status: 404,
      });
    }

    // Check if user is the author of the comment
    if (existingComment.authorId !== session.user.id) {
      return createErrorResponse({
        code: "FORBIDDEN",
        message: "You can only edit your own comments",
        status: 403,
      });
    }

    // Update comment
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: content.trim(),
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
        likes: {
          where: { 
            userId: session.user.id,
            commentId: commentId
          },
          select: { id: true },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    // Transform to IComment interface
    const commentResponse: IComment = {
      id: updatedComment.id,
      content: updatedComment.content,
      createdAt: updatedComment.createdAt.toISOString(),
      isLiked: updatedComment.likes.length > 0,
      author: {
        id: updatedComment.author.id,
        name: updatedComment.author.name || "",
        profileImage: updatedComment.author.profileImage,
        username: updatedComment.author.username || "",
      },
      _count: {
        likes: updatedComment._count.likes,
      },
    };

    return createSuccessResponse({
      data: commentResponse,
      message: "Comment updated successfully",
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    return createErrorResponse({
      code: "UPDATE_COMMENT_ERROR",
      message: "Error updating comment",
      status: 500,
    });
  }
}

// DELETE /api/posts/{postId}/comments/{commentId} - Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: ParamsType }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse({
        code: "UNAUTHORIZED",
        message: "You must be logged in to delete comments",
        status: 401,
      });
    }

    const { postId, commentId } = await params;

    // Check if comment exists and belongs to the post
    const existingComment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        postId: postId,
      },
      include: {
        post: {
          select: {
            authorId: true,
          },
        },
      },
    });

    if (!existingComment) {
      return createErrorResponse({
        code: "COMMENT_NOT_FOUND",
        message: "Comment not found",
        status: 404,
      });
    }

    // Check if user is the author of the comment or the post owner
    const isCommentAuthor = existingComment.authorId === session.user.id;
    const isPostOwner = existingComment.post.authorId === session.user.id;

    if (!isCommentAuthor && !isPostOwner) {
      return createErrorResponse({
        code: "FORBIDDEN",
        message: "You can only delete your own comments or comments on your posts",
        status: 403,
      });
    }

    // Delete comment (likes will be deleted automatically due to cascade)
    await prisma.comment.delete({
      where: { id: commentId },
    });

    return createSuccessResponse({
      data: { 
        id: commentId,
        message: "Comment deleted successfully" 
      },
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return createErrorResponse({
      code: "DELETE_COMMENT_ERROR",
      message: "Error deleting comment",
      status: 500,
    });
  }
}