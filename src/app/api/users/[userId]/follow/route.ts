import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

type ParamsType = Promise<{ userId: string }>;

// POST /api/users/[userId]/follow - Toggle follow user
export async function POST(
  request: NextRequest,
  { params }: { params: ParamsType }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse({
        code: "UNAUTHORIZED",
        message: "You must be logged in to follow users",
        status: 401,
      });
    }

    const { userId } = await params;
    console.log(`userId`,userId)
    console.log("session.user.id",session.user.id)
    // Check if trying to follow themselves
    if (userId === session.user.id) {
      return createErrorResponse({
        code: "INVALID_ACTION",
        message: "You cannot follow yourself",
        status: 400,
      });
    }

    // Check if user exists
    const userToFollow = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToFollow) {
      return createErrorResponse({
        code: "USER_NOT_FOUND",
        message: "User not found",
        status: 404,
      });
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followingId_followerId: {
          followingId: userId,
          followerId: session.user.id,
        },
      },
    });
    if (existingFollow) {
      // Unfollow the user
      await prisma.follow.delete({
        where: {
          id: existingFollow.id,
        },
      });

      return createSuccessResponse({
        data: { following: false },
        message: "User unfollowed successfully",
      });
    } else {
      // Follow the user
      await prisma.follow.create({
        data: {
          followerId: session.user.id,
          followingId: userId,
        },
      });

      return createSuccessResponse({
        data: { following: true },
        message: "User followed successfully",
      });
    }
  } catch (error) {
    console.error("Error toggling follow:", error);
    return createErrorResponse({
      code: "TOGGLE_FOLLOW_ERROR",
      message: "Error toggling follow",
      status: 500,
    });
  }
}
