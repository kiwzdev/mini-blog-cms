import { NextRequest } from "next/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { IComment } from "@/types/blog";

type ParamsType = Promise<{ blogId: string }>;

// GET /api/blogs/{blogId}/comments - Get all comments for a blog
export async function GET(
  request: NextRequest,
  { params }: { params: ParamsType }
) {
  try {
    const session = await getServerSession(authOptions);
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

    const comments = await prisma.comment.findMany({
      where: { blogId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            username: true,
          },
        },
        // Check if user has liked the comment
        likes: session?.user?.id
          ? {
              where: {
                userId: session.user.id,
              },
              select: { id: true },
            }
          : false,
        // Count the number of likes
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const commentsResponse: IComment[] = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      isLiked: session?.user?.id ? comment.likes.length > 0 : false,
      author: {
        id: comment.author.id,
        name: comment.author.name || "",
        profileImage: comment.author.profileImage,
        username: comment.author.username || "",
      },
      _count: {
        likes: comment._count.likes,
      },
    }));

    return createSuccessResponse({
      data: commentsResponse,
      message: "Comments retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return createErrorResponse({
      code: "FETCH_COMMENTS_ERROR",
      message: "Error fetching comments",
      status: 500,
    });
  }
}

// POST /api/blogs/{blogId}/comments - Create a new comment
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

    const { blogId } = await params;
    const body = await request.json();
    const { content } = body;
    console.log(`content: ${content}`);

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

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        blogId: blogId,
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

    // Transform to IComment interface
    const commentResponse: IComment = {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      isLiked: false, // New comment, user hasn't liked it yet
      author: {
        id: comment.author.id,
        name: comment.author.name || "",
        profileImage: comment.author.profileImage,
        username: comment.author.username || "",
      },
      _count: {
        likes: 0,
      },
    };

    return createSuccessResponse({
      data: commentResponse,
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
