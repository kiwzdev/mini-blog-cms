import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";
import { ICreateBlogInput } from "@/types/blog";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";

// GET /api/blogs - Get all blogs with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const whereClause = {
      published: true,
      ...(userId && { authorId: userId }),
    };

    // 1. ใช้ Promise.all เพื่อ parallel queries
    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
      prisma.blog.count({ where: whereClause })
    ]);

    // 2. แยก query likes ถ้า user login
    let likedBlogIds: string[] = [];
    if (session?.user?.id && blogs.length > 0) {
      const likes = await prisma.blogLike.findMany({
        where: {
          userId: session.user.id,
          blogId: { in: blogs.map(blog => blog.id) }
        },
        select: { blogId: true }
      });
      likedBlogIds = likes.map(like => like.blogId);
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
// -- สำหรับ blogs query
// CREATE INDEX idx_blogs_published_created ON blogs(published, createdAt DESC);
// CREATE INDEX idx_blogs_author_published ON blogs(authorId, published, createdAt DESC);

// -- สำหรับ likes query
// CREATE INDEX idx_likes_user_blog ON likes(userId, blogId);

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
