import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";
import { ICreateBlogInput } from "@/types/blog";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { Prisma } from "@prisma/client";

// Constants
const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;
const MAX_LIMIT = 100;

// Helper function to parse and validate pagination params
function parsePaginationParams(searchParams: URLSearchParams) {
  const limit = Math.min(
    parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT)),
    MAX_LIMIT
  );
  const page = Math.max(
    parseInt(searchParams.get("page") || String(DEFAULT_PAGE)),
    1
  );
  const skip = (page - 1) * limit;

  return { limit, page, skip };
}

// Helper function to build where clause
function buildWhereClause(
  searchParams: URLSearchParams
): Prisma.BlogWhereInput {
  const search = searchParams.get("search")?.trim();
  const category = searchParams.get("category")?.trim();
  const status = searchParams.get("status")?.trim();

  const whereClause: Prisma.BlogWhereInput = {};

  // Default to published blogs only unless status is explicitly set
  if (!status || status === "all") {
    whereClause.published = true;
  } else if (status === "published") {
    whereClause.published = true;
  } else if (status === "draft") {
    whereClause.published = false;
  }

  // Search in title and excerpt
  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { excerpt: { contains: search, mode: "insensitive" } },
    ];
  }

  // Filter by category
  if (category && category !== "all") {
    whereClause.category = category;
  }

  return whereClause;
}

// Helper function to build order by clause
function buildOrderByClause(
  searchParams: URLSearchParams
): Prisma.BlogOrderByWithRelationInput {
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") ||
    "desc") as Prisma.SortOrder;

  switch (sortBy) {
    case "likes":
      return { likes: { _count: sortOrder } };
    case "title":
      return { title: sortOrder };
    case "createdAt":
    default:
      return { createdAt: sortOrder };
  }
}

// Shared blog select fields
const BLOG_SELECT_FIELDS = {
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
} as const;

// GET /api/blogs - Get all blogs with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);

    const { limit, page, skip } = parsePaginationParams(searchParams);
    const whereClause = buildWhereClause(searchParams);
    const orderBy = buildOrderByClause(searchParams);

    // Parallel queries for blogs and total count
    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy,
        select: BLOG_SELECT_FIELDS,
      }),
      prisma.blog.count({ where: whereClause }),
    ]);

    // Get liked blog IDs for authenticated users
    const likedBlogIds =
      session?.user?.id && blogs.length > 0
        ? await prisma.blogLike
            .findMany({
              where: {
                userId: session.user.id,
                blogId: { in: blogs.map((blog) => blog.id) },
              },
              select: { blogId: true },
            })
            .then((likes) => likes.map((like) => like.blogId))
        : [];

    // Add isLiked status to blogs
    const blogsWithLikeStatus = blogs.map((blog) => ({
      ...blog,
      isLiked: likedBlogIds.includes(blog.id),
    }));

    return createSuccessResponse({
      data: {
        blogs: blogsWithLikeStatus
      },
      message: "Blogs fetched successfully",
      meta:{
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
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

    if (!session?.user?.id) {
      return createErrorResponse({
        code: "UNAUTHORIZED",
        message: "You must be logged in to create a blog",
        status: 401,
      });
    }

    const body: ICreateBlogInput = await request.json();

    // Validate required fields
    if (!body.title?.trim() || !body.content?.trim() || !body.slug?.trim()) {
      return createErrorResponse({
        code: "VALIDATION_ERROR",
        message: "Title, content, and slug are required",
        status: 400,
      });
    }

    const {
      title,
      content,
      contentType,
      excerpt,
      slug,
      coverImage,
      published = false, // Default to draft
      category,
    } = body;

    // Check if slug already exists
    const existingBlog = await prisma.blog.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existingBlog) {
      return createErrorResponse({
        code: "SLUG_EXISTS",
        message: "A blog with this slug already exists",
        status: 409,
      });
    }

    const blog = await prisma.blog.create({
      data: {
        title: title.trim(),
        slug: slug.trim(),
        content,
        contentType,
        excerpt: excerpt?.trim(),
        coverImage,
        published,
        category,
        authorId: session.user.id,
      },
      select: {
        ...BLOG_SELECT_FIELDS,
        content: true,
        contentType: true,
        published: true,
        updatedAt: true,
      },
    });

    return createSuccessResponse({
      data: {
        blogs: blog,
      },
      message: "Blog created successfully",
    });
  } catch (error) {
    console.error("Error creating blog:", error);

    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return createErrorResponse({
          code: "DUPLICATE_ENTRY",
          message: "A blog with this slug already exists",
          status: 409,
        });
      }
    }

    return createErrorResponse({
      code: "CREATE_BLOG_ERROR",
      message: "Failed to create blog",
    });
  }
}
