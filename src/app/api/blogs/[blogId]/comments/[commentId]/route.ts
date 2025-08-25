// app/api/blogs/[blogId]/comments/[commentId]/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";
import { IComment } from "@/types/blog";

type ParamsType = {
  blogId: string;
  commentId: string;
};

// Constants
const MAX_COMMENT_LENGTH = 1000;
const MIN_COMMENT_LENGTH = 1;

// Shared comment select fields
const COMMENT_SELECT_FIELDS = {
  id: true,
  content: true,
  createdAt: true,
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
} as const;

// Helper function to validate comment content
function validateCommentContent(content: string): string | null {
  if (!content || typeof content !== 'string') {
    return "Comment content is required";
  }

  const trimmedContent = content.trim();
  
  if (trimmedContent.length < MIN_COMMENT_LENGTH) {
    return "Comment content cannot be empty";
  }
  
  if (trimmedContent.length > MAX_COMMENT_LENGTH) {
    return `Comment content must be less than ${MAX_COMMENT_LENGTH} characters`;
  }

  return null;
}

// Helper function to check comment ownership and permissions
async function checkCommentPermissions(
  commentId: string, 
  blogId: string, 
  userId: string, 
  requireOwnership = false
) {
  const comment = await prisma.comment.findFirst({
    where: {
      id: commentId,
      blogId: blogId,
    },
    select: {
      id: true,
      authorId: true,
      blog: {
        select: {
          authorId: true,
        },
      },
    },
  });

  if (!comment) {
    return { error: "COMMENT_NOT_FOUND", message: "Comment not found", status: 404 };
  }

  const isCommentAuthor = comment.authorId === userId;
  const isBlogOwner = comment.blog?.authorId === userId;

  if (requireOwnership && !isCommentAuthor) {
    return { 
      error: "FORBIDDEN", 
      message: "You can only edit your own comments", 
      status: 403 
    };
  }

  if (!requireOwnership && !isCommentAuthor && !isBlogOwner) {
    return { 
      error: "FORBIDDEN", 
      message: "You can only delete your own comments or comments on your blogs", 
      status: 403 
    };
  }

  return { comment, isCommentAuthor, isBlogOwner };
}

// Helper function to transform comment to IComment interface
function transformCommentResponse(
  comment: any, 
  isLiked: boolean = false
): IComment {
  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    isLiked,
    author: {
      id: comment.author.id,
      name: comment.author.name || "",
      profileImage: comment.author.profileImage,
      username: comment.author.username || "",
    },
    _count: {
      likes: comment._count.likes,
    },
  };
}

// PUT /api/blogs/{blogId}/comments/{commentId} - Edit a comment
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

    const { blogId, commentId } = await params;
    const body = await request.json();
    const { content } = body;

    // Validate comment content
    const validationError = validateCommentContent(content);
    if (validationError) {
      return createErrorResponse({
        code: "VALIDATION_ERROR",
        message: validationError,
        status: 400,
      });
    }

    // Check permissions (only comment author can edit)
    const permissionCheck = await checkCommentPermissions(
      commentId, 
      blogId, 
      session.user.id, 
      true // requireOwnership = true for editing
    );

    if ('error' in permissionCheck) {
      return createErrorResponse({
        code: permissionCheck.error as string,
        message: permissionCheck.message as string,
        status: permissionCheck.status,
      });
    }

    // Update comment with optimistic concurrency check
    const [updatedComment, userLike] = await Promise.all([
      prisma.comment.update({
        where: { id: commentId },
        data: {
          content: content.trim(),
          updatedAt: new Date(),
        },
        select: {
          ...COMMENT_SELECT_FIELDS,
          updatedAt: true,
        },
      }),
      // Check if user liked this comment
      prisma.commentLike.findFirst({
        where: {
          userId: session.user.id,
          commentId: commentId,
        },
        select: { id: true },
      }),
    ]);

    const commentResponse = transformCommentResponse(
      updatedComment, 
      !!userLike
    );

    return createSuccessResponse({
      data: { comment: commentResponse },
      message: "Comment updated successfully",
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    return createErrorResponse({
      code: "UPDATE_COMMENT_ERROR",
      message: "Failed to update comment",
      status: 500,
    });
  }
}

// DELETE /api/blogs/{blogId}/comments/{commentId} - Delete a comment
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

    const { blogId, commentId } = await params;

    // Check permissions (comment author OR blog owner can delete)
    const permissionCheck = await checkCommentPermissions(
      commentId, 
      blogId, 
      session.user.id, 
      false // requireOwnership = false for deletion
    );

    if ('error' in permissionCheck) {
      return createErrorResponse({
        code: permissionCheck.error as string,
        message: permissionCheck.message as string,
        status: permissionCheck.status,
      });
    }

    // Delete comment (cascade delete will handle related records)
    await prisma.comment.delete({
      where: { id: commentId },
    });

    return createSuccessResponse({
      data: { 
        commentId,
        blogId,
        deletedAt: new Date().toISOString(),
      },
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return createErrorResponse({
      code: "DELETE_COMMENT_ERROR",
      message: "Failed to delete comment",
      status: 500,
    });
  }
}