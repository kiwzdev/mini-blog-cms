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

    const blogs = await prisma.blog.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            username: true,
          },
        },
        // ดึงข้อมูล likes เสมอเพื่อตรวจสอบ isLiked
        likes: session?.user?.id
          ? {
              where: {
                userId: session.user.id,
              },
              select: {
                id: true,
              },
            }
          : false,
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    // เพิ่ม isLiked ให้กับแต่ละ blog
    const blogsWithLikeStatus = blogs.map((blog) => ({
      ...blog,
      isLiked: session?.user?.id ? blog.likes.length > 0 : false,
      likes: undefined, // ลบ likes array ออกเพื่อไม่ให้ response ใหญ่เกินไป
    }));

    const total = await prisma.blog.count({ where: whereClause });

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
