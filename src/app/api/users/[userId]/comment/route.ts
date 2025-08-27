// app/api/users/[userId]/comment/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { IComment } from "@/types/blog";
import { Prisma } from "@prisma/client";

type ParamsType = Promise<{ userId: string }>;

// Helper function to validate content
function validateContent(content: string): string | null {
  if (!content) return "Content is required";

  const trimmedContent = content.trim();
  if (trimmedContent.length === 0) return "Content cannot be empty";
  if (trimmedContent.length > 1000)
    return "Content too long (max 1000 characters)";

  return null;
}

// POST /api/users/[userId]/comment - Create comment on user profile
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<ParamsType> }
) {
  try {
    const { userId } = await params;

    // Parse body และ get session พร้อมกัน
    const [body, session] = await Promise.all([
      request.json(),
      getServerSession(authOptions),
    ]);

    // Early authentication check
    if (!session?.user?.id) {
      return createErrorResponse({
        code: "UNAUTHORIZED",
        message: "Please login to comment",
        status: 401,
      });
    }

    const { content } = body;

    // Validate content
    const contentError = validateContent(content);
    if (contentError) {
      return createErrorResponse({
        code: "INVALID_CONTENT",
        message: contentError,
        status: 400,
      });
    }

    const trimmedContent = content.trim();
    const currentUserId = session.user.id;

    // Prevent self-commenting (if business logic requires)
    if (currentUserId === userId) {
      return createErrorResponse({
        code: "SELF_COMMENT_NOT_ALLOWED",
        message: "You cannot comment on your own profile",
        status: 400,
      });
    }

    // ใช้ transaction เพื่อ consistency และ performance
    const result = await prisma.$transaction(async (tx) => {
      // ตรวจสอบว่า target user มีอยู่จริง
      const targetUser = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true }, // เพิ่ม name สำหรับ response
      });

      if (!targetUser) {
        throw new Error("USER_NOT_FOUND");
      }

      // สร้าง comment พร้อม optimized includes
      const comment = await tx.comment.create({
        data: {
          content: trimmedContent,
          authorId: currentUserId,
          userId: userId,
        },
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
          _count: {
            select: {
              likes: true,
            },
          },
          // เช็ค like เฉพาะ comment ที่เพิ่งสร้าง (จะเป็น empty array เสมอ)
          likes: {
            where: { userId: currentUserId },
            select: { id: true },
            take: 1,
          },
        },
      });

      return comment;
    });

    // Transform response data
    const responseData: IComment = {
      id: result.id,
      content: result.content,
      createdAt: result.createdAt.toISOString(),
      isLiked: false, // Comment ที่เพิ่งสร้างจะยัง like ไม่ได้
      author: result.author,
      _count: {
        likes: result._count.likes,
      },
    };

    return createSuccessResponse({
      data: responseData,
      message: "Comment created successfully",
    });
  } catch (error) {
    console.error("Error creating comment:", error);

    // Handle specific errors
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return createErrorResponse({
        code: "USER_NOT_FOUND",
        message: "User not found",
        status: 404,
      });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle foreign key constraint errors
      if (error.code === "P2003") {
        return createErrorResponse({
          code: "INVALID_USER_REFERENCE",
          message: "Invalid user reference",
          status: 400,
        });
      }

      // Handle unique constraint violations (if any)
      if (error.code === "P2002") {
        return createErrorResponse({
          code: "DUPLICATE_COMMENT",
          message: "Duplicate comment detected",
          status: 409,
        });
      }
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return createErrorResponse({
        code: "INVALID_JSON",
        message: "Invalid JSON in request body",
        status: 400,
      });
    }

    return createErrorResponse({
      code: "CREATE_COMMENT_ERROR",
      message: "Error creating comment",
      status: 500,
    });
  }
}

// GET /api/users/[userId]/comment - Get user profile comments (bonus optimization)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<ParamsType> }
) {
  try {
    const { userId } = await params;
    const { searchParams } = request.nextUrl;

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      20,
      Math.max(1, parseInt(searchParams.get("limit") || "10"))
    );
    const skip = (page - 1) * limit;

    // Check if user exists และ get comments พร้อมกัน
    const [targetUser, comments] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true },
      }),
      prisma.comment.findMany({
        where: { userId: userId },
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
          _count: {
            select: {
              likes: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    if (!targetUser) {
      return createErrorResponse({
        code: "USER_NOT_FOUND",
        message: "User not found",
        status: 404,
      });
    }

    // Transform data
    const responseData: Omit<IComment, "isLiked">[] = comments.map(
      (comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        author: comment.author,
        _count: {
          likes: comment._count.likes,
        },
      })
    );

    return createSuccessResponse({
      data: responseData,
      message: "Comments fetched successfully",
      meta: {
        page,
        limit,
        total: comments.length,
        pages: Math.ceil(comments.length / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return createErrorResponse({
      code: "FETCH_COMMENTS_ERROR",
      message: "Error fetching comments",
      status: 500,
    });
  }
}
