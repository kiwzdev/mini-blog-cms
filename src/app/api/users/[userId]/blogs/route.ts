// app/api/users/[userId]/blogs/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { IBlogCard } from "@/types/blog";
import { Prisma } from "@prisma/client";

type ParamsType = Promise<{ userId: string }>;

// Helper function to build where clause
function buildWhereClause(
  userId: string,
  isOwnProfile: boolean,
  filters: {
    category?: string | null;
    status?: string | null;
    search?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  }
): Prisma.BlogWhereInput {
  const whereClause: Prisma.BlogWhereInput = {
    authorId: userId,
  };

  // Published filter - optimized logic
  if (filters.status && filters.status !== "all") {
    whereClause.published = filters.status === "published";
  } else if (!isOwnProfile) {
    whereClause.published = true;
  }

  // Category filter - early return for empty values
  if (
    filters.category &&
    filters.category !== "all" &&
    filters.category.trim() !== ""
  ) {
    whereClause.category = filters.category;
  }

  // Search filter - optimized with trimming
  if (filters.search?.trim()) {
    const searchTerm = filters.search.trim();
    whereClause.OR = [
      { title: { contains: searchTerm, mode: "insensitive" } },
      { excerpt: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  // Date range filter - optimized date handling
  if (filters.startDate || filters.endDate) {
    const dateFilter: Prisma.DateTimeFilter = {};

    if (filters.startDate) {
      dateFilter.gte = new Date(filters.startDate);
    }

    if (filters.endDate) {
      const endDateTime = new Date(filters.endDate);
      endDateTime.setUTCHours(23, 59, 59, 999);
      dateFilter.lte = endDateTime;
    }

    whereClause.createdAt = dateFilter;
  }

  return whereClause;
}

// Helper function to build orderBy clause
function buildOrderByClause(
  sortBy: string,
  sortOrder: Prisma.SortOrder
): Prisma.BlogOrderByWithRelationInput {
  const orderMap: Record<string, Prisma.BlogOrderByWithRelationInput> = {
    title: { title: sortOrder },
    updatedAt: { updatedAt: sortOrder },
    views: { views: sortOrder },
    likes: { likes: { _count: sortOrder } },
    comments: { comments: { _count: sortOrder } },
    createdAt: { createdAt: sortOrder },
  };

  return orderMap[sortBy] || orderMap.createdAt;
}

// GET /api/users/[userId]/blogs - ดึง blog พร้อม pagination และ filters
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<ParamsType> }
) {
  try {
    const { userId } = await params;
    const { searchParams } = request.nextUrl; // ใช้ nextUrl แทน new URL()

    // Parse and validate parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "10"))
    ); // จำกัด limit
    const skip = (page - 1) * limit;

    // Extract filters
    const filters = {
      category: searchParams.get("category"),
      status: searchParams.get("status"),
      search: searchParams.get("search"),
      startDate:
        searchParams.get("start") || searchParams.get("dateRange[start]"),
      endDate: searchParams.get("end") || searchParams.get("dateRange[end]"),
    };

    // Sorting parameters
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") ||
      "desc") as Prisma.SortOrder;

    // Get session in parallel with user check (if needed)
    const sessionPromise = getServerSession(authOptions);

    // Check if user exists และ session พร้อมกัน
    const [userExists, session] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      }),
      sessionPromise,
    ]);

    if (!userExists) {
      return createErrorResponse({
        code: "USER_NOT_FOUND",
        message: "User not found",
        status: 404,
      });
    }

    const isOwnProfile = session?.user?.id === userId;
    const whereClause = buildWhereClause(userId, isOwnProfile, filters);
    const orderBy = buildOrderByClause(sortBy, sortOrder);

    // Optimized select for better performance
    const selectFields = {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      published: true,
      createdAt: true,
      updatedAt: true,
      category: true,
      views: true,
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
      // เฉพาะเมื่อ user login เท่านั้น
      ...(session?.user?.id && {
        likes: {
          where: { userId: session.user.id },
          select: { id: true },
          take: 1, // เอาแค่ 1 record เพื่อเช็ค exists
        },
      }),
    };

    // ใช้ Promise.all สำหรับ parallel queries
    const [posts, totalPosts] = await Promise.all([
      prisma.blog.findMany({
        where: whereClause,
        select: selectFields,
        orderBy,
        skip,
        take: limit,
      }),
      // ใช้ count เฉพาะเมื่อจำเป็น (page > 1 หรือต้องการ pagination info)
      page > 1 || searchParams.has("total")
        ? prisma.blog.count({ where: whereClause })
        : Promise.resolve(0),
    ]);

    // Optimized data transformation
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
      isLiked: Boolean(
        post.likes && Array.isArray(post.likes) && post.likes.length > 0
      ),
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

    // Optimized pagination metadata
    const meta = {
      page,
      limit,
      total: totalPosts > 0 ? totalPosts : 0,
      pages: totalPosts > 0 ? Math.ceil(totalPosts / limit) : 1,
    };

    return createSuccessResponse({
      data: responseData,
      message: "User blogs fetched successfully",
      meta,
    });
  } catch (error) {
    console.error("Error fetching user blogs:", error);

    // Handle specific Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return createErrorResponse({
          code: "USER_NOT_FOUND",
          message: "User not found",
          status: 404,
        });
      }

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
