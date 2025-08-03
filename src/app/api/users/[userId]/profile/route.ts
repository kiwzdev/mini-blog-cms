import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import {
  IUserBadge,
  IUserCount,
  IUserProfile,
  IUserSettings,
  IUserSocialLinks,
  IUserStatus,
} from "@/types/user";

type ParamsType = Promise<{ userId: string }>;

// GET /api/users/[userId]/profile - ดึงข้อมูลโปรไฟล์และสถิติ
export async function GET(
  request: NextRequest,
  { params }: { params: ParamsType }
) {
  try {
    const { userId } = await params;
    const session = await getServerSession(authOptions);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            blogs: true,
            followers: true,
            following: true,
            blogLikes: true,
            comments: true,
          },
        },
      },
    });

    if (!user) {
      return createErrorResponse({
        code: "USER_NOT_FOUND",
        message: "User not found",
        status: 404,
      });
    }

    // Check if user is viewing their own profile
    const isOwnProfile = session?.user?.id === userId;

    const responseData: IUserProfile = {
      id: user.id,
      username: user.username,
      name: user.name,
      bio: user.bio || "",
      profileImage: user.profileImage || "",
      coverImage: user.coverImage || "",
      socialLinks: user.socialLinks as IUserSocialLinks,
      location: user.location || "",
      createdAt: user.createdAt,
      lastActiveAt: user.lastActiveAt || undefined,
      jobTitle: user.jobTitle || "",
      company: user.company || "",
      education: user.education || "",
      status: user.status as IUserStatus,
      badge: user.badge as IUserBadge,
      _count: {
        ...user._count,
        views: user.views,
      } as IUserCount,
      // Include private fields only for own profile
      ...(isOwnProfile && {
        email: user.email || "",
        phone: user.phone || "",
        birthDate: user.birthDate || undefined,
        settings: user.settings as IUserSettings,
      }),
    };

    return createSuccessResponse({
      data: responseData,
      message: "User profile fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return createErrorResponse({
      code: "FETCH_PROFILE_ERROR",
      message: "Error fetching user profile",
      status: 500,
    });
  }
}

// PUT /api/users/[userId]/profile - อัพเดทโปรไฟล์
export async function PUT(
  request: NextRequest,
  { params }: { params: ParamsType }
) {
  try {
    const { userId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse({
        code: "UNAUTHORIZED",
        message: "Please login to update profile",
        status: 401,
      });
    }

    if (session.user.id !== userId) {
      return createErrorResponse({
        code: "FORBIDDEN",
        message: "You can only update your own profile",
        status: 403,
      });
    }

    const body = await request.json();
    const {
      name,
      bio,
      profileImage,
      coverImage,
      socialLinks,
      location,
      jobTitle,
      company,
      education,
      phone,
      birthDate,
      settings,
    } = body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(profileImage !== undefined && { profileImage }),
        ...(coverImage !== undefined && { coverImage }),
        ...(socialLinks && { socialLinks }),
        ...(location !== undefined && { location }),
        ...(jobTitle !== undefined && { jobTitle }),
        ...(company !== undefined && { company }),
        ...(education !== undefined && { education }),
        ...(phone !== undefined && { phone }),
        ...(birthDate && { birthDate: new Date(birthDate) }),
        ...(settings && { settings }),
      },
      include: {
        _count: {
          select: {
            blogs: true,
            followers: true,
            following: true,
            blogLikes: true,
            comments: true,
          },
        },
      },
    });

    const updatedUserWithViews = {
      ...updatedUser,
      _count: {
        ...updatedUser._count,
        views: updatedUser.views,
      },
    };

    return createSuccessResponse({
      data: updatedUserWithViews,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return createErrorResponse({
      code: "UPDATE_PROFILE_ERROR",
      message: "Error updating profile",
      status: 500,
    });
  }
}
