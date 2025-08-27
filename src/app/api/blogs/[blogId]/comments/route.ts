import { NextRequest } from "next/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { IComment } from "@/types/blog";

type ParamsType = Promise<{ blogId: string }>;

// ✅ 1. Cache blog existence check
const blogExistsCache = new Map<string, boolean>();
const BLOG_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function checkBlogExists(blogId: string): Promise<boolean> {
  const cacheKey = `blog_${blogId}`;
  const cached = blogExistsCache.get(cacheKey);
  
  if (cached !== undefined) {
    return cached;
  }

  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    select: { id: true }, // ✅ Select only needed field
  });

  const exists = !!blog;
  blogExistsCache.set(cacheKey, exists);
  
  // Clear cache after TTL
  setTimeout(() => {
    blogExistsCache.delete(cacheKey);
  }, BLOG_CACHE_TTL);

  return exists;
}

// GET /api/blogs/{blogId}/comments - Get all comments for a blog
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<ParamsType> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { blogId } = await params;

    // ✅ 2. Add pagination support
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50); // Max 50
    const skip = (page - 1) * limit;

    // ✅ 3. Use cached blog check
    const blogExists = await checkBlogExists(blogId);
    if (!blogExists) {
      return createErrorResponse({
        code: "BLOG_NOT_FOUND",
        message: "Blog not found",
        status: 404,
      });
    }

    // ✅ 4. Optimized single query with conditional likes
    const comments = await prisma.comment.findMany({
      where: { blogId },
      select: {
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
        // ✅ Only query likes if user is logged in
        ...(session?.user?.id && {
          likes: {
            where: { userId: session.user.id },
            select: { id: true },
          },
        }),
        _count: {
          select: { likes: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: skip,
    });

    // ✅ 5. Get total count only when needed (first page)
    let totalCount = undefined;
    if (page === 1) {
      totalCount = await prisma.comment.count({
        where: { blogId },
      });
    }

    // ✅ 6. Optimized mapping
    const commentsResponse: IComment[] = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      isLiked: session?.user?.id ? comment.likes?.length > 0 : false,
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

    const responseData = {
      comments: commentsResponse,
      pagination: {
        page,
        limit,
        hasMore: comments.length === limit,
        ...(totalCount !== undefined && { total: totalCount }),
      },
    };

    return createSuccessResponse({
      data: responseData,
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
  { params }: { params: Promise<ParamsType> }
) {
  try {
    // ✅ 7. Early auth check
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

    // ✅ 8. Validation first (cheaper than DB query)
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return createErrorResponse({
        code: "INVALID_CONTENT",
        message: "Comment content is required",
        status: 400,
      });
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length > 1000) {
      return createErrorResponse({
        code: "CONTENT_TOO_LONG",
        message: "Comment content must be less than 1000 characters",
        status: 400,
      });
    }

    // ✅ 9. Use cached blog check
    const blogExists = await checkBlogExists(blogId);
    if (!blogExists) {
      return createErrorResponse({
        code: "BLOG_NOT_FOUND",
        message: "Blog not found",
        status: 404,
      });
    }

    // ✅ 10. Optimized create with select
    const comment = await prisma.comment.create({
      data: {
        content: trimmedContent,
        blogId: blogId,
        authorId: session.user.id,
      },
      select: {
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
      },
    });

    // ✅ 11. Clear cache when new comment is added
    blogExistsCache.set(`blog_${blogId}`, true);

    const commentResponse: IComment = {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      isLiked: false,
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

// DELETE /api/blogs/{blogId}/comments/{commentId} - Delete a comment
// TODO
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<ParamsType>}
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse({
        code: "UNAUTHORIZED",
        message: "You must be logged in",
        status: 401,
      });
    }

    const { blogId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const commentId = searchParams.get("commentId");

    if (!commentId) {
      return createErrorResponse({
        code: "MISSING_COMMENT_ID",
        message: "Comment ID is required",
        status: 400,
      });
    }

    // Check if comment exists and user owns it
    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        blogId: blogId,
        authorId: session.user.id,
      },
      select: { id: true },
    });

    if (!comment) {
      return createErrorResponse({
        code: "COMMENT_NOT_FOUND",
        message: "Comment not found or you don't have permission",
        status: 404,
      });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return createSuccessResponse({
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