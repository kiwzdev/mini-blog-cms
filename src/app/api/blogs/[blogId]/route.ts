import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/db";
import { UpdateBlogInput } from "@/lib/validations/blogSchema";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { Prisma } from "@prisma/client";
import { IComment } from "@/types/blog";

type ParamsType = Promise<{ blogId: string }>;

// ✅ 1. Cache for blog existence and basic info
const blogCache = new Map<string, { exists: boolean; authorId: string; published: boolean }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getBlogBasicInfo(blogId: string) {
  const cached = blogCache.get(blogId);
  if (cached) return cached;

  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    select: { 
      id: true, 
      authorId: true, 
      published: true 
    },
  });

  const info = blog 
    ? { exists: true, authorId: blog.authorId, published: blog.published }
    : { exists: false, authorId: '', published: false };
  
  blogCache.set(blogId, info);
  
  setTimeout(() => {
    blogCache.delete(blogId);
  }, CACHE_TTL);

  return info;
}

// ✅ 2. Helper function for reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// ✅ 3. Optimized view increment (background task)
async function incrementViewCount(blogId: string, authorId: string, currentUserId?: string) {
  if (authorId !== currentUserId) {
    // Fire-and-forget view increment
    prisma.blog.update({
      where: { id: blogId },
      data: { views: { increment: 1 } },
    }).catch(error => {
      console.error("Error incrementing view count:", error);
    });
  }
}

// GET /api/blogs/[blogId] - Get single blog by blogId
export async function GET(
  request: NextRequest,
  { params }: { params: ParamsType }
) {
  try {
    const { blogId } = await params;
    const { searchParams } = new URL(request.url);

    // ✅ 4. Early validation and session
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    // Check blog existence first
    const basicInfo = await getBlogBasicInfo(blogId);
    if (!basicInfo.exists) {
      return createErrorResponse({
        code: "BLOG_NOT_FOUND",
        message: "Blog not found",
        status: 404,
      });
    }

    // ✅ 5. Early authorization check
    if (!basicInfo.published && basicInfo.authorId !== currentUserId) {
      return createErrorResponse({
        code: "UNAUTHORIZED",
        message: "You are not authorized to view this blog",
        status: 401,
      });
    }

    // ✅ 6. Background view increment
    incrementViewCount(blogId, basicInfo.authorId, currentUserId);

    // Parse query params
    const includeRelated = searchParams.get("includeRelated") === "true";
    const includeComments = searchParams.get("includeComments") !== "false"; // default true
    const commentsLimit = Math.min(parseInt(searchParams.get("commentsLimit") || "5"), 20);

    // ✅ 7. Conditional queries based on what's needed
    const blogQuery = prisma.blog.findUnique({
      where: { id: blogId },
      select: {
        id: true,
        title: true,
        content: true,
        contentType: true,
        excerpt: true,
        slug: true,
        coverImage: true,
        category: true,
        published: true,
        views: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            username: true,
          },
        },
        // ✅ Conditional includes
        ...(includeComments && {
          comments: {
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
              // ✅ Only get user's like status for comments
              ...(currentUserId && {
                likes: {
                  where: { userId: currentUserId },
                  select: { id: true },
                },
              }),
              _count: {
                select: { likes: true },
              },
            },
            orderBy: { createdAt: "desc" },
            take: commentsLimit,
          },
        }),
        // ✅ Get like status efficiently
        ...(currentUserId && {
          likes: {
            where: { userId: currentUserId },
            select: { id: true },
          },
        }),
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    // ✅ 8. Optimized related blogs query
    let relatedBlogsQuery = null;
    if (includeRelated) {
      const page = parseInt(searchParams.get("page") || "1");
      const limit = Math.min(parseInt(searchParams.get("limit") || "6"), 20);
      const skip = (page - 1) * limit;
      
      const search = searchParams.get("search");
      const category = searchParams.get("category");
      const sortBy = searchParams.get("sortBy") || "createdAt";
      const sortOrder = (searchParams.get("sortOrder") || "desc") as Prisma.SortOrder;

      // ✅ Get blog category for related blogs
      const blogCategory = await prisma.blog.findUnique({
        where: { id: blogId },
        select: { category: true },
      });

      const relatedWhereClause: Prisma.BlogWhereInput = {
        published: true,
        id: { not: blogId },
        category: category && category !== "all" ? category : blogCategory?.category,
      };

      if (search) {
        relatedWhereClause.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { excerpt: { contains: search, mode: "insensitive" } },
        ];
      }

      let orderBy: Prisma.BlogOrderByWithRelationInput;
      switch (sortBy) {
        case "likes":
          orderBy = { likes: { _count: sortOrder } };
          break;
        case "views":
          orderBy = { views: sortOrder };
          break;
        default:
          orderBy = { createdAt: sortOrder };
          break;
      }

      relatedBlogsQuery = Promise.all([
        prisma.blog.findMany({
          where: relatedWhereClause,
          select: {
            id: true,
            title: true,
            excerpt: true,
            coverImage: true,
            category: true,
            views: true,
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
                comments: true,
                likes: true,
              },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.blog.count({ where: relatedWhereClause }),
      ]);
    }

    // ✅ 9. Execute queries in parallel
    const [blog, relatedBlogsResult] = await Promise.all([
      blogQuery,
      relatedBlogsQuery,
    ]);

    if (!blog) {
      return createErrorResponse({
        code: "BLOG_NOT_FOUND",
        message: "Blog not found",
        status: 404,
      });
    }

    // ✅ 10. Efficient response construction
    const isLiked = currentUserId && blog.likes ? blog.likes.length > 0 : false;
    const isAuthor = currentUserId === blog.authorId;
    const readingTime = calculateReadingTime(blog.content);

    // ✅ 11. Transform comments efficiently
    const transformedComments = includeComments && blog.comments 
      ? blog.comments.map(comment => ({
          ...comment,
          isLiked: currentUserId && (comment as any).likes ? (comment as any).likes.length > 0 : false,
        }))
      : [];

    const responseData = {
      blog: {
        ...blog,
        isLiked,
        isAuthor,
        readingTime,
        ...(includeComments && { comments: transformedComments }),
      },
      ...(includeRelated && relatedBlogsResult && {
        relatedBlogs: {
          data: relatedBlogsResult[0],
          pagination: {
            page: parseInt(searchParams.get("page") || "1"),
            limit: Math.min(parseInt(searchParams.get("limit") || "6"), 20),
            total: relatedBlogsResult[1],
            hasMore: relatedBlogsResult[0].length === Math.min(parseInt(searchParams.get("limit") || "6"), 20),
          },
        },
      }),
    };

    return createSuccessResponse({
      data: responseData,
      message: "Blog fetched successfully",
    });

  } catch (error) {
    console.error("Error fetching blog:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return createErrorResponse({
          code: "BLOG_NOT_FOUND",
          message: "Blog not found",
          status: 404,
        });
      }
    }

    return createErrorResponse({
      code: "FETCH_BLOG_ERROR",
      message: "Error fetching blog",
      status: 500,
    });
  }
}

// ✅ 12. Optimized PUT endpoint
export async function PUT(
  request: NextRequest,
  { params }: { params: ParamsType }
) {
  try {
    // Early auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse({
        code: "UNAUTHORIZED",
        message: "You must be logged in to update a blog",
        status: 401,
      });
    }

    const { blogId } = await params;
    
    // ✅ Use cached basic info
    const basicInfo = await getBlogBasicInfo(blogId);
    if (!basicInfo.exists) {
      return createErrorResponse({
        code: "BLOG_NOT_FOUND",
        message: "Blog not found",
        status: 404,
      });
    }

    if (basicInfo.authorId !== session.user.id) {
      return createErrorResponse({
        code: "FORBIDDEN",
        message: "You don't have permission to update this blog",
        status: 403,
      });
    }

    const body: UpdateBlogInput = await request.json();
    const {
      title,
      content,
      contentType,
      excerpt,
      slug,
      coverImage,
      published,
      category,
    } = body;

    // ✅ Clear cache on update
    blogCache.delete(blogId);

    const blog = await prisma.blog.update({
      where: { id: blogId },
      data: {
        title,
        content,
        contentType,
        excerpt,
        slug,
        coverImage,
        published,
        category,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        content: true,
        contentType: true,
        excerpt: true,
        slug: true,
        coverImage: true,
        published: true,
        category: true,
        views: true,
        createdAt: true,
        updatedAt: true,
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
            comments: true,
            likes: true,
          },
        },
      },
    });

    return createSuccessResponse({
      data: blog,
      message: "Blog updated successfully",
    });

  } catch (error) {
    console.error("Error updating blog:", error);
    return createErrorResponse({
      code: "UPDATE_BLOG_ERROR",
      message: "Failed to update blog",
      status: 500,
    });
  }
}

// ✅ 13. Optimized DELETE endpoint
export async function DELETE(
  request: NextRequest,
  { params }: { params: ParamsType }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse({
        code: "UNAUTHORIZED",
        message: "You must be logged in to delete a blog",
        status: 401,
      });
    }

    const { blogId } = await params;

    // ✅ Use cached basic info
    const basicInfo = await getBlogBasicInfo(blogId);
    if (!basicInfo.exists) {
      return createErrorResponse({
        code: "BLOG_NOT_FOUND",
        message: "Blog not found",
        status: 404,
      });
    }

    if (basicInfo.authorId !== session.user.id) {
      return createErrorResponse({
        code: "FORBIDDEN",
        message: "You don't have permission to delete this blog",
        status: 403,
      });
    }

    // ✅ Clear cache on delete
    blogCache.delete(blogId);

    await prisma.blog.delete({
      where: { id: blogId },
    });

    return createSuccessResponse({
      data: null,
      message: "Blog deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting blog:", error);
    return createErrorResponse({
      code: "DELETE_BLOG_ERROR",
      message: "Failed to delete blog",
      status: 500,
    });
  }
}