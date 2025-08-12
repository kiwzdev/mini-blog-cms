import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";
import { ICreateBlogInput } from "@/types/blog";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { Prisma } from "@prisma/client";

// GET /api/blogs - Get all blogs with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);

    // Pagination params
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Filters params
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    // Sorting params
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Type-safe approach
    const whereClause: Prisma.BlogWhereInput = {
      published: true,
    };

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "all") {
      whereClause.category = category;
    }

    if (status && status !== "all") {
      if (status === "published") {
        whereClause.published = true; // Published
      } else if (status === "draft") {
        whereClause.published = false; // Unpublished
      }
    }

    // Type-safe orderBy
    let orderBy: Prisma.BlogOrderByWithRelationInput;
    switch (sortBy) {
      case "likes":
        orderBy = { likes: { _count: sortOrder as Prisma.SortOrder } };
        break;
      case "createdAt":
      default:
        orderBy = { createdAt: sortOrder as Prisma.SortOrder };
        break;
    }

    // 1. ใช้ Promise.all เพื่อ parallel queries
    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          createdAt: true,
          category: true,
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
      }),
      prisma.blog.count({ where: whereClause }),
    ]);

    // 2. แยก query likes ถ้า user login
    let likedBlogIds: string[] = [];
    if (session?.user?.id && blogs.length > 0) {
      const likes = await prisma.blogLike.findMany({
        where: {
          userId: session.user.id,
          blogId: { in: blogs.map((blog) => blog.id) },
        },
        select: { blogId: true },
      });
      likedBlogIds = likes.map((like) => like.blogId);
    }

    // 3. Map isLiked ให้กับ blogs
    const blogsWithLikeStatus = blogs.map((blog) => ({
      ...blog,
      isLiked: likedBlogIds.includes(blog.id),
    }));

    return createSuccessResponse({
      data: {
        blogs: blogsWithLikeStatus,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: "Blogs fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return createErrorResponse({
      code: "FETCH_BLOGS_ERROR",
      message: "Failed to fetch blogs",
    });
  }
}

// POST /api/blogs - Create new blog
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return createErrorResponse({
        code: "UNAUTHORIZED",
        message: "You must be logged in to create a blog",
        status: 401,
      });
    }

    const body: ICreateBlogInput = await request.json();
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

    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        content,
        contentType,
        excerpt,
        coverImage,
        published,
        category,
        authorId: session?.user.id,
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
            comments: true,
            likes: true,
          },
        },
      },
    });

    return createSuccessResponse({
      data: blog,
      message: "Blog created successfully",
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    return createErrorResponse({
      code: "CREATE_BLOG_ERROR",
      message: "Failed to create blog",
    });
  }
}
