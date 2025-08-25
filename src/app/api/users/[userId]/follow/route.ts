import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

type ParamsType = Promise<{ userId: string }>;

// POST /api/users/[userId]/follow - Toggle follow user
export async function POST(
  request: NextRequest,
  { params }: { params: ParamsType }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return createErrorResponse({
        code: "MISSING_USER_ID",
        message: "User ID is required",
        status: 400,
      });
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse({
        code: "UNAUTHORIZED",
        message: "You must be logged in to follow users",
        status: 401,
      });
    }

    const currentUserId = session.user.id;

    // Check self-follow early
    if (userId === currentUserId) {
      return createErrorResponse({
        code: "INVALID_ACTION",
        message: "You cannot follow yourself",
        status: 400,
      });
    }

    console.log(`Following user ${userId} by ${currentUserId}`);

    // ใช้ transaction เพื่อ consistency และ performance
    const result = await prisma.$transaction(
      async (tx) => {
        // รวม user existence check กับ follow status check ในคำสั่งเดียว
        const existingFollow = await tx.follow.findUnique({
          where: {
            followingId_followerId: {
              followingId: userId,
              followerId: currentUserId,
            },
          },
          select: {
            id: true,
            following: {
              select: {
                id: true,
                name: true, // เพิ่มเพื่อ verify user exists
              },
            },
          },
        });

        // ถ้าไม่มี follow record แต่ต้องตรวจสอบว่า user มีอยู่
        if (!existingFollow) {
          const userToFollow = await tx.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true },
          });

          if (!userToFollow) {
            throw new Error("USER_NOT_FOUND");
          }

          // สร้าง follow relationship
          await tx.follow.create({
            data: {
              followerId: currentUserId,
              followingId: userId,
            },
          });

          return {
            following: true,
            userExists: true,
            targetUserName: userToFollow.name,
          };
        } else {
          // User มีอยู่แล้ว (เพราะมี follow record) และต้อง unfollow
          await tx.follow.delete({
            where: {
              id: existingFollow.id,
            },
          });

          return {
            following: false,
            userExists: true,
            targetUserName: existingFollow.following.name,
          };
        }
      },
      {
        // เพิ่ม transaction options สำหรับ performance
        maxWait: 5000, // 5 seconds
        timeout: 10000, // 10 seconds
      }
    );

    const message = result.following
      ? `Started following ${result.targetUserName || "user"}`
      : `Unfollowed ${result.targetUserName || "user"}`;

    return createSuccessResponse({
      data: {
        following: result.following,
        userId: userId,
      },
      message: message,
    });
  } catch (error) {
    console.error("Error toggling follow:", error);

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

      // Handle unique constraint violations
      if (error.code === "P2002") {
        return createErrorResponse({
          code: "DUPLICATE_FOLLOW",
          message: "Follow relationship already exists",
          status: 409,
        });
      }

      // Handle record not found in delete
      if (error.code === "P2025") {
        return createErrorResponse({
          code: "FOLLOW_NOT_FOUND",
          message: "Follow relationship not found",
          status: 404,
        });
      }
    }

    // Handle transaction timeout
    if (error instanceof Error && error.message.includes("timeout")) {
      return createErrorResponse({
        code: "OPERATION_TIMEOUT",
        message: "Operation timed out, please try again",
        status: 408,
      });
    }

    return createErrorResponse({
      code: "TOGGLE_FOLLOW_ERROR",
      message: "Error toggling follow status",
      status: 500,
    });
  }
}

// GET /api/users/[userId]/follow - Get follow status (bonus optimization)
export async function GET(
  request: NextRequest,
  { params }: { params: ParamsType }
) {
  try {
    const { userId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse({
        code: "UNAUTHORIZED",
        message: "Please login to check follow status",
        status: 401,
      });
    }

    if (!userId) {
      return createErrorResponse({
        code: "MISSING_USER_ID",
        message: "User ID is required",
        status: 400,
      });
    }

    const currentUserId = session.user.id;

    // Self-follow check
    if (userId === currentUserId) {
      return createSuccessResponse({
        data: {
          following: false,
          canFollow: false,
          reason: "Cannot follow yourself",
        },
        message: "Follow status retrieved",
      });
    }

    // Check follow status และ user existence พร้อมกัน
    const [followStatus, userExists] = await Promise.all([
      prisma.follow.findUnique({
        where: {
          followingId_followerId: {
            followingId: userId,
            followerId: currentUserId,
          },
        },
        select: { id: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true },
      }),
    ]);

    if (!userExists) {
      return createErrorResponse({
        code: "USER_NOT_FOUND",
        message: "User not found",
        status: 404,
      });
    }

    return createSuccessResponse({
      data: {
        following: Boolean(followStatus),
        canFollow: true,
        targetUser: {
          id: userExists.id,
          name: userExists.name,
        },
      },
      message: "Follow status retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting follow status:", error);
    return createErrorResponse({
      code: "GET_FOLLOW_STATUS_ERROR",
      message: "Error getting follow status",
      status: 500,
    });
  }
}
