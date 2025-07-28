import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/db";
import { UpdatePostInput } from "@/lib/validations/postSchema";

// GET /api/posts/[slug] - Get single post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
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

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if post is published or user is the author
    const session = await getServerSession(authOptions);
    if (!post.published && post.authorId !== session?.user?.id) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[id] - Update post
export async function PUT(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = params;
    const body: UpdatePostInput = await request.json();

    // Check if user owns the post
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, title: true, slug: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    const post = await prisma.post.update({
      where: { id: postId },
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

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = params;

    // Check if user owns the post
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
