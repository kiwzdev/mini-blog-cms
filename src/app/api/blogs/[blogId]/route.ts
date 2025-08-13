import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/db";
import { UpdateBlogInput } from "@/lib/validations/blogSchema";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { Prisma } from "@prisma/client";

type ParamsType = Promise<{ blogId: string }>;

// GET /api/blogs/[blogId] - Get single blog by blogId
export async function GET(
  request: NextRequest,
  { params }: { params: ParamsType }
) {
  try {
    const { blogId } = await params;
    const { searchParams } = new URL(request.url);

    // Pagination params for related blogs
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "6");
    const skip = (page - 1) * limit;

    // Filters params
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    // Sorting params
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as Prisma.SortOrder;

    // Include related blogs flag
    const includeRelated = searchParams.get("includeRelated") === "true";

    // Get current session
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    // Fetch the main blog
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            username: true,
          },
        },
        comments: {
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
          orderBy: { createdAt: "desc" },
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
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

    if (!blog) {
      return createErrorResponse({
        code: "BLOG_NOT_FOUND",
        message: "Blog not found",
        status: 404,
      });
    }

    // Check if blog is published or user is the author
    if (!blog.published && blog.authorId !== currentUserId) {
      return createErrorResponse({
        code: "UNAUTHORIZED",
        message: "You are not authorized to view this blog",
        status: 401,
      });
    }

    // Increment blog views (only if not the author)
    if (blog.authorId !== currentUserId) {
      await prisma.blog.update({
        where: { id: blogId },
        data: { views: { increment: 1 } },
      });
    }

    // Check if user liked this blog
    const isLiked = currentUserId
      ? blog.likes.some((like) => like.user.id === currentUserId)
      : false;

    let relatedBlogs = null;
    let relatedBlogsTotal = 0;

    // Fetch related blogs if requested
    if (includeRelated) {
      // Build where clause for related blogs
      const relatedWhereClause: Prisma.BlogWhereInput = {
        published: true,
        id: { not: blogId }, // Exclude current blog
      };

      // Apply filters
      if (search) {
        relatedWhereClause.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { excerpt: { contains: search, mode: "insensitive" } },
        ];
      }

      if (category && category !== "all") {
        relatedWhereClause.category = category;
      } else {
        // Show blogs from same category if no specific filter
        relatedWhereClause.category = blog.category;
      }

      if (status && status !== "all") {
        if (status === "published") {
          relatedWhereClause.published = true;
        } else if (status === "draft") {
          relatedWhereClause.published = false;
          // Only show drafts if user is authenticated and it's their own
          if (currentUserId) {
            relatedWhereClause.authorId = currentUserId;
          } else {
            // If not authenticated, don't show any drafts
            relatedWhereClause.published = true;
          }
        }
      }

      // Build orderBy clause
      let orderBy: Prisma.BlogOrderByWithRelationInput;
      switch (sortBy) {
        case "likes":
          orderBy = { likes: { _count: sortOrder } };
          break;
        case "views":
          orderBy = { views: sortOrder };
          break;
        case "title":
          orderBy = { title: sortOrder };
          break;
        case "updatedAt":
          orderBy = { updatedAt: sortOrder };
          break;
        case "createdAt":
        default:
          orderBy = { createdAt: sortOrder };
          break;
      }

      // Fetch related blogs and count
      const [blogsList, totalCount] = await Promise.all([
        prisma.blog.findMany({
          where: relatedWhereClause,
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
                comments: true,
                likes: true,
              },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.blog.count({
          where: relatedWhereClause,
        }),
      ]);

      relatedBlogs = blogsList;
      relatedBlogsTotal = totalCount;
    }

    // Prepare response data
    const responseData = {
      blog: {
        ...blog,
        isLiked,
        isAuthor: currentUserId === blog.authorId,
      },
      ...(includeRelated && {
        relatedBlogs: {
          data: relatedBlogs,
          pagination: {
            page,
            limit,
            total: relatedBlogsTotal,
            totalPages: Math.ceil(relatedBlogsTotal / limit),
            hasNextPage: page < Math.ceil(relatedBlogsTotal / limit),
            hasPrevPage: page > 1,
          },
          appliedFilters: {
            search,
            category: category || blog.category,
            status,
            sortBy,
            sortOrder,
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

    // Handle specific Prisma errors
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

// Helper function to calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// PUT /api/blogs/[id] - Update blog
export async function PUT(
  request: NextRequest,
  { params }: { params: ParamsType }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse({
        code: "UNAUTHORIZED",
        message: "You must be logged in to update a blog",
        status: 401,
      });
    }

    const { blogId } = await params;
    const body: UpdateBlogInput = await request.json();

    // Check if user owns the blog
    const existingBlog = await prisma.blog.findUnique({
      where: { id: blogId },
      select: { authorId: true },
    });

    if (!existingBlog) {
      return createErrorResponse({
        code: "BLOG_NOT_FOUND",
        message: "Blog not found",
        status: 404,
      });
    }

    if (existingBlog.authorId !== session?.user.id) {
      return createErrorResponse({
        code: "FORBIDDEN",
        message: "You don't have permission to update this blog",
        status: 403,
      });
    }

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

    const updateData = {
      content,
      contentType,
      excerpt,
      coverImage,
      published,
      category,
      title,
      slug,
    };

    const blog = await prisma.blog.update({
      where: { id: blogId },
      data: updateData,
      include: {
        author: {
          // Include the author
          select: {
            id: true,
            name: true,
            profileImage: true,
            username: true,
          },
        },
        _count: {
          // Include comment and like counts
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
      message: "Failed to update blogs",
      status: 500,
    });
  }
}

// DELETE /api/blogs/[id] - Delete blog
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

    // Check if user owns the blog
    const existingBlog = await prisma.blog.findUnique({
      where: { id: blogId },
      select: { authorId: true },
    });

    if (!existingBlog) {
      return createErrorResponse({
        code: "BLOG_NOT_FOUND",
        message: "Blog not found",
        status: 404,
      });
    }

    if (existingBlog.authorId !== session?.user.id) {
      return createErrorResponse({
        code: "FORBIDDEN",
        message: "You don't have permission to delete this blog",
        status: 403,
      });
    }

    await prisma.blog.delete({
      where: { id: blogId },
    });

    return NextResponse.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return createErrorResponse({
      code: "DELETE_BLOG_ERROR",
      message: "Failed to delete blog",
    });
  }
}
