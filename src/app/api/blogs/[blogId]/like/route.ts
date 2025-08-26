import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

type ParamsType = Promise<{ blogId: string }>;

// ✅ 1. Reuse blog cache from comments API
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
    select: { id: true }, // Only select what we need
  });

  const exists = !!blog;
  blogExistsCache.set(cacheKey, exists);

  setTimeout(() => {
    blogExistsCache.delete(cacheKey);
  }, BLOG_CACHE_TTL);

  return exists;
}

// ✅ Improved cache to store blog data with authorId
const blogCache = new Map<
  string,
  { exists: boolean; authorId: string | null }
>();

async function getBlogInfo(
  blogId: string
): Promise<{ exists: boolean; authorId: string | null }> {
  const cacheKey = `blog_${blogId}`;
  const cached = blogCache.get(cacheKey);

  if (cached !== undefined) {
    return cached;
  }

  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    select: { id: true, authorId: true },
  });

  const blogInfo = {
    exists: !!blog,
    authorId: blog?.authorId || null,
  };

  blogCache.set(cacheKey, blogInfo);

  setTimeout(() => {
    blogCache.delete(cacheKey);
  }, BLOG_CACHE_TTL);

  return blogInfo;
}

// POST /api/blogs/[blogId]/like - Toggle like on blog
export async function POST(
  request: NextRequest,
  { params }: { params: ParamsType }
) {
  try {
    // ✅ Early auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse({
        code: "UNAUTHORIZED",
        message: "You must be logged in to like blogs",
        status: 401,
      });
    }

    const { blogId } = await params;
    const userId = session.user.id;

    // ✅ Get blog info with authorId
    const blogInfo = await getBlogInfo(blogId);
    if (!blogInfo.exists || !blogInfo.authorId) {
      return createErrorResponse({
        code: "BLOG_NOT_FOUND",
        message: "Blog not found",
        status: 404,
      });
    }

    // ✅ Self-like prevention
    if (blogInfo.authorId === userId) {
      return createErrorResponse({
        code: "SELF_LIKE_NOT_ALLOWED",
        message: "You cannot like your own blog",
        status: 400,
      });
    }

    // ✅ Use upsert pattern with proper transactions
    try {
      // Try to create the like first
      const newLike = await prisma.blogLike.create({
        data: {
          blogId: blogId,
          userId: userId,
        },
      });

      // ✅ Single transaction for like + increment
      await prisma.user.update({
        where: { id: blogInfo.authorId },
        data: {
          totalBlogLikes: {
            increment: 1,
          },
        },
      });

      // ✅ Get final count
      const likeCount = await prisma.blogLike.count({
        where: { blogId: blogId },
      });

      return createSuccessResponse({
        data: {
          liked: true,
          likeCount: likeCount,
        },
        message: "Blog liked successfully",
      });
    } catch (createError: unknown) {
      // ✅ Handle unique constraint error (already liked)
      if (
        createError &&
        typeof createError === "object" &&
        "code" in createError &&
        createError.code === "P2002"
      ) {
        // ✅ Unlike with transaction
        await prisma.$transaction([
          prisma.blogLike.delete({
            where: {
              blogId_userId: {
                blogId: blogId,
                userId: userId,
              },
            },
          }),
          prisma.user.update({
            where: { id: blogInfo.authorId! },
            data: {
              totalBlogLikes: {
                decrement: 1,
              },
            },
          }),
        ]);

        const likeCount = await prisma.blogLike.count({
          where: { blogId: blogId },
        });

        return createSuccessResponse({
          data: {
            liked: false,
            likeCount: likeCount,
          },
          message: "Blog unliked successfully",
        });
      }

      // Re-throw if it's a different error
      throw createError;
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

// TODO
export async function GET(
  request: NextRequest,
  { params }: { params: ParamsType }
) {
  try {
    const session = await getServerSession(authOptions);
    const { blogId } = await params;

    const blogExists = await checkBlogExists(blogId);
    if (!blogExists) {
      return createErrorResponse({
        code: "BLOG_NOT_FOUND",
        message: "Blog not found",
        status: 404,
      });
    }

    // Get like status and count in single query
    const [likeStatus, likeCount] = await Promise.all([
      session?.user?.id
        ? prisma.blogLike.findUnique({
            where: {
              blogId_userId: {
                blogId: blogId,
                userId: session.user.id,
              },
            },
            select: { id: true },
          })
        : Promise.resolve(null),
      prisma.blogLike.count({
        where: { blogId: blogId },
      }),
    ]);

    return createSuccessResponse({
      data: {
        liked: !!likeStatus,
        likeCount: likeCount,
      },
      message: "Like status retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting like status:", error);
    return createErrorResponse({
      code: "GET_LIKE_STATUS_ERROR",
      message: "Error getting like status",
      status: 500,
    });
  }
}
