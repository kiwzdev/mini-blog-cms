import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/db";
import { UpdateBlogInput } from "@/lib/validations/blogSchema";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";

type ParamsType = Promise<{ blogId: string }>;

// GET /api/blogs/[blogId] - Get single blog by blogId
export async function GET(
  request: NextRequest,
  { params }: { params: ParamsType }
) {
  try {
    const { blogId } = await params;

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
    const session = await getServerSession(authOptions);
    if (!blog.published && blog.authorId !== session?.user?.id) {
      return createErrorResponse({
        code: "UNAUTHORIZED",
        message: "You are not authorized to view this blog",
        status: 401,
      });
    }

    // Increment blog views
    await prisma.blog.update({
      where: { id: blogId },
      data: { views: { increment: 1 } },
    });

    const isLiked = session?.user?.id
      ? blog.likes.some((like) => like.user.id === session.user.id)
      : false;

    const responseData = {
      ...blog,
      isLiked,
    };

    return createSuccessResponse({
      data: responseData,
      message: "Blog fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return createErrorResponse({
      code: "FETCH_BLOG_ERROR",
      message: "Error fetching blog",
      status: 500,
    });
  }
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
