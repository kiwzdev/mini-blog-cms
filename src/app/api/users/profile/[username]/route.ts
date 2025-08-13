import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/db";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import {
  IUserSettings,
} from "@/types/user";
import { isValidImageType, MAX_FILE_SIZE } from "@/helpers/uploadFile";
import cloudinary from "@/lib/cloudinary";

type ParamsType = Promise<{ username: string }>;

// GET /api/users/[userId]/profile - ดึงข้อมูลโปรไฟล์และสถิติ
export async function GET(
  request: NextRequest,
  { params }: { params: ParamsType }
) {
  try {
    const { username } = await params;
    const session = await getServerSession(authOptions);

    const user = await prisma.user.findUnique({
      where: { username },
      cacheStrategy: { ttl: 60 }, // FIX
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

    // Increment blog views
    await prisma.user.update({
      where: { id: user.id },
      data: { views: { increment: 1 } },
    });

    // Check if user is viewing their own profile
    const isOwnProfile = session?.user?.username === username;

    const responseData = {
      ...user,
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
    const { username } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse({
        code: "UNAUTHORIZED",
        message: "Please login to update profile",
        status: 401,
      });
    }

    if (session.user.username !== username) {
      return createErrorResponse({
        code: "FORBIDDEN",
        message: "You can only update your own profile",
        status: 403,
      });
    }

    // รับ FormData แทน JSON
    const formData = await request.formData();

    // ดึงข้อมูล text fields
    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const location = formData.get("location") as string;
    const jobTitle = formData.get("jobTitle") as string;
    const company = formData.get("company") as string;
    const education = formData.get("education") as string;
    const phone = formData.get("phone") as string;
    const birthDate = formData.get("birthDate") as string;
    const settings = formData.get("settings") as string;
    const socialLinks = formData.get("socialLinks") as string;
    const oldProfileImage = formData.get("oldProfileImage") as string;

    // ดึงไฟล์รูป
    const profileImageFile = formData.get("profileImage") as File;

    let profileImageUrl: string | undefined;

    // อัพโหลดรูปโปรไฟล์ (ถ้ามี)
    if (profileImageFile && profileImageFile.size > 0) {
      // ตรวจสอบไฟล์
      if (profileImageFile.size > MAX_FILE_SIZE) {
        return createErrorResponse({
          code: "FILE_TOO_LARGE",
          message: `File size too large. Maximum size is ${
            MAX_FILE_SIZE / (1024 * 1024)
          }MB`,
          status: 400,
        });
      }

      if (!isValidImageType(profileImageFile)) {
        return createErrorResponse({
          code: "INVALID_FILE_TYPE",
          message:
            "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed",
          status: 400,
        });
      }

      // อัพโหลดรูปใหม่
      const arrayBuffer = await profileImageFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const dataURI = `data:${profileImageFile.type};base64,${base64}`;

      const uploadRes = await cloudinary.uploader.upload(dataURI, {
        folder: "mini-blog/profiles",
        transformation: [
          {
            width: 400,
            height: 400,
            crop: "fill",
            quality: "auto:good",
            format: "auto",
          },
        ],
        resource_type: "auto",
        unique_filename: true,
        overwrite: false,
      });

      profileImageUrl = uploadRes.public_id;

      // ลบรูปเก่า (async)
      if (oldProfileImage) {
        Promise.resolve().then(async () => {
          try {
            await cloudinary.uploader.destroy(oldProfileImage);
            console.log("Old profile image deleted:", oldProfileImage);
          } catch (err) {
            console.error("Failed to delete old profile image:", err);
          }
        });
      }
    }

    // Parse JSON fields
    const parsedSocialLinks = socialLinks ? JSON.parse(socialLinks) : undefined;
    const parsedSettings = settings ? JSON.parse(settings) : undefined;
    console.log(parsedSettings)

    const updatedUser = await prisma.user.update({
      where: { username: username },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(profileImageUrl !== undefined && { profileImage: profileImageUrl }),
        ...(parsedSocialLinks && { socialLinks: parsedSocialLinks }),
        ...(location !== undefined && { location }),
        ...(jobTitle !== undefined && { jobTitle }),
        ...(company !== undefined && { company }),
        ...(education !== undefined && { education }),
        ...(phone !== undefined && { phone }),
        ...(birthDate && { birthDate: new Date(birthDate) }),
        ...(parsedSettings && { settings: parsedSettings }),
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
