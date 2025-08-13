// app/api/users/[userId]/blogs/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { IBlogCard } from "@/types/blog";
import { Prisma } from "@prisma/client";

type ParamsType = Promise<{ userId: string }>;

// GET /api/users/[userId]/blogs - ดึง blog พร้อม pagination และ filters
export async function GET(
  request: NextRequest,
  { params }: { params: ParamsType }
) {
  try {
    const { userId } = await params;
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Filters
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const startDate = searchParams.get("start") || searchParams.get("dateRange[start]");
    const endDate = searchParams.get("end") || searchParams.get("dateRange[end]");

    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as Prisma.SortOrder;

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      return createErrorResponse({
        code: "USER_NOT_FOUND",
        message: "User not found",
        status: 404,
      });
    }

    const isOwnProfile = session?.user?.id === userId;

    // Build where clause
    const whereClause: Prisma.BlogWhereInput = {
      authorId: userId,
    };

    // Published filter
    if (status && status !== "all") {
      if (status === "published") {
        whereClause.published = true;
      } else if (status === "draft") {
        whereClause.published = false;
      }
    } else {
      // Default behavior: show only published unless own profile
      if (!isOwnProfile) {
        whereClause.published = true;
      }
    }

    // Category filter
    if (category && category !== "all" && category !== "") {
      whereClause.category = category;
    }

    // Search filter
    if (search && search.trim() !== "") {
      whereClause.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { excerpt: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999); // End of day
        whereClause.createdAt.lte = endDateTime;
      }
    }

    // Build orderBy clause
    let orderBy: Prisma.BlogOrderByWithRelationInput;
    switch (sortBy) {
      case "title":
        orderBy = { title: sortOrder };
        break;
      case "updatedAt":
        orderBy = { updatedAt: sortOrder };
        break;
      case "views":
        orderBy = { views: sortOrder };
        break;
      case "likes":
        orderBy = { likes: { _count: sortOrder } };
        break;
      case "comments":
        orderBy = { comments: { _count: sortOrder } };
        break;
      case "createdAt":
      default:
        orderBy = { createdAt: sortOrder };
        break;
    }

    // Fetch posts and count
    const [posts, totalPosts] = await Promise.all([
      prisma.blog.findMany({
        where: whereClause,
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
          likes: session?.user?.id
            ? {
                where: { userId: session.user.id },
                select: { id: true },
              }
            : false,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.blog.count({
        where: whereClause,
      }),
    ]);

    // Transform data
    const responseData: IBlogCard[] = posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      coverImage: post.coverImage || undefined,
      published: post.published,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      category: post.category || undefined,
      views: post.views,
      isLiked: Array.isArray(post.likes) ? post.likes.length > 0 : false,
      author: {
        id: post.author.id,
        name: post.author.name,
        profileImage: post.author.profileImage || undefined,
        username: post.author.username,
      },
      _count: {
        comments: post._count.comments,
        likes: post._count.likes,
      },
    }));

    return createSuccessResponse({
      data: responseData,
      message: "User blogs fetched successfully",
      meta:{
        page,
        limit,
        total: totalPosts,
        pages: Math.ceil(totalPosts / limit),
      }
    });
  } catch (error) {
    console.error("Error fetching user blogs:", error);

    // Handle specific Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return createErrorResponse({
        code: "DATABASE_ERROR",
        message: "Database query failed",
        status: 500,
      });
    }

    return createErrorResponse({
      code: "FETCH_BLOGS_ERROR",
      message: "Error fetching user blogs",
      status: 500,
    });
  }
}