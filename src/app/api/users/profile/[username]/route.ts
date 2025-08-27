import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { IUpdateProfileData, IUserSettings } from "@/types/user";
import { isValidImageType, MAX_FILE_SIZE } from "@/helpers/uploadFile";
import cloudinary from "@/lib/cloudinary";
import { Prisma } from "@prisma/client";
import { UploadApiResponse } from "cloudinary";

type ParamsType = Promise<{ username: string }>;

// Helper function to validate profile data
function validateProfileData(data: IUpdateProfileData): string | null {
  if (data.name && data.name.length > 100)
    return "Name too long (max 100 characters)";
  if (data.bio && data.bio.length > 500)
    return "Bio too long (max 500 characters)";
  if (data.location && data.location.length > 100)
    return "Location too long (max 100 characters)";
  if (data.jobTitle && data.jobTitle.length > 100)
    return "Job title too long (max 100 characters)";
  if (data.company && data.company.length > 100)
    return "Company too long (max 100 characters)";
  if (data.education && data.education.length > 200)
    return "Education too long (max 200 characters)";
  if (data.phone && !/^\+?[\d\s\-\(\)]+$/.test(data.phone))
    return "Invalid phone number format";

  return null;
}

// GET /api/users/[username]/profile - ดึงข้อมูลโปรไฟล์และสถิติ
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<ParamsType> }
) {
  try {
    const { username } = await params;
    const { searchParams } = request.nextUrl;
    const skipViewIncrement = searchParams.get("skipViews") === "true";

    const session = await getServerSession(authOptions);

    const isOwnProfile = session?.user?.username === username;

    // Get session พร้อมกับ query user
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        profileImage: true,
        socialLinks: true,
        location: true,
        jobTitle: true,
        company: true,
        education: true,
        views: true,
        totalBlogLikes: true,
        createdAt: true,
        updatedAt: true,
        // Conditional fields
        ...(isOwnProfile && {
          email: true,
          phone: true,
          birthDate: true,
          settings: true,
        }),
        _count: {
          select: {
            blogs: true,
            followers: true,
            following: true,
            comments: true,
          },
        },
      },
      // ใช้ cache strategy สำหรับ public profiles
      ...(isOwnProfile && {
        cacheStrategy: { ttl: 60 },
      }),
    });

    if (!user) {
      return createErrorResponse({
        code: "USER_NOT_FOUND",
        message: "User not found",
        status: 404,
      });
    }

    // Increment views เฉพาะเมื่อไม่ใช่ owner และไม่ skip
    let viewsPromise: Promise<{ views: number } | null> = Promise.resolve(null);
    if (!isOwnProfile && !skipViewIncrement) {
      viewsPromise = prisma.user
        .update({
          where: { id: user.id },
          data: { views: { increment: 1 } },
          select: { views: true },
        })
        .catch((err) => {
          console.warn("Failed to increment views:", err);
          return null;
        });
    }

    // รอ views update (หรือ skip) และส่ง response
    const updatedViews = await viewsPromise;

    let isFollowed;
    if (!isOwnProfile) {
      isFollowed = await prisma.follow.findFirst({
        where: {
          followerId: session?.user?.id,
          followingId: user.id,
        },
      });
    }

    const responseData = {
      ...user,
      views: updatedViews?.views || user.views,
      // Transform _count to include views
      _count: {
        ...user._count,
        views: updatedViews?.views || user.views,
        totalBlogLikes: user.totalBlogLikes,
      },
      isFollowed: isFollowed ? true : false,
      // Include private fields only for own profile
      ...(isOwnProfile && {
        email: user.email || "",
        phone: user.phone || "",
        birthDate: user.birthDate || undefined,
        settings: (user.settings as IUserSettings) || {},
      }),
    };

    return createSuccessResponse({
      data: responseData,
      message: "User profile fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return createErrorResponse({
          code: "USER_NOT_FOUND",
          message: "User not found",
          status: 404,
        });
      }
    }

    return createErrorResponse({
      code: "FETCH_PROFILE_ERROR",
      message: "Error fetching user profile",
      status: 500,
    });
  }
}

// PUT /api/users/[username]/profile - อัพเดทโปรไฟล์
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<ParamsType> }
) {
  try {
    const { username } = await params;

    // Get session และ parse formData พร้อมกัน
    const [session, formData] = await Promise.all([
      getServerSession(authOptions),
      request.formData(),
    ]);

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

    // Extract และ validate ข้อมูล
    const profileData = {
      name: formData.get("name") as string,
      bio: formData.get("bio") as string,
      location: formData.get("location") as string,
      jobTitle: formData.get("jobTitle") as string,
      company: formData.get("company") as string,
      education: formData.get("education") as string,
      phone: formData.get("phone") as string,
      birthDate: formData.get("birthDate") as string,
      settings: formData.get("settings") as string,
      socialLinks: JSON.parse(formData.get("socialLinks") as string),
      oldProfileImage: formData.get("oldProfileImage") as string,
    };

    const profileImageFile = formData.get("profileImage") as File;

    // Validate profile data
    const validationError = validateProfileData(profileData);
    if (validationError) {
      return createErrorResponse({
        code: "VALIDATION_ERROR",
        message: validationError,
        status: 400,
      });
    }

    let profileImageUrl: string | undefined;
    let imageUploadPromise: Promise<UploadApiResponse | null> = Promise.resolve(null);

    // Handle image upload
    if (profileImageFile && profileImageFile.size > 0) {
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

      // Upload image
      const arrayBuffer = await profileImageFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const dataURI = `data:${profileImageFile.type};base64,${base64}`;

      imageUploadPromise = cloudinary.uploader.upload(dataURI, {
        folder: "mini-blog/profiles",
        transformation: [
          {
            width: 400,
            height: 400,
            crop: "fill",
            quality: "auto:good",
            format: "auto",
            fetch_format: "auto",
          },
        ],
        resource_type: "auto",
        unique_filename: true,
        overwrite: false,
      });
    }

    // Parse JSON fields
    let parsedSettings = undefined;

    try {
      if (profileData.settings) {
        parsedSettings = JSON.parse(profileData.settings);
        console.log("Parsed settings:", parsedSettings);
      }
    } catch {
      return createErrorResponse({
        code: "INVALID_JSON",
        message: "Invalid JSON format in settings or social links",
        status: 400,
      });
    }

    // Wait for image upload (if any)
    const uploadResult = await imageUploadPromise;
    if (uploadResult) {
      profileImageUrl = uploadResult.public_id;
    }

    // Build update data object
    const updateData: Prisma.UserUpdateInput = {};

    if (profileData.name) updateData.name = profileData.name;
    if (profileData.bio !== undefined) updateData.bio = profileData.bio;
    if (profileImageUrl !== undefined)
      updateData.profileImage = profileImageUrl;
    updateData.socialLinks = profileData.socialLinks;
    if (profileData.location !== undefined)
      updateData.location = profileData.location;
    if (profileData.jobTitle !== undefined)
      updateData.jobTitle = profileData.jobTitle;
    if (profileData.company !== undefined)
      updateData.company = profileData.company;
    if (profileData.education !== undefined)
      updateData.education = profileData.education;
    if (profileData.phone !== undefined) updateData.phone = profileData.phone;
    if (profileData.birthDate)
      updateData.birthDate = new Date(profileData.birthDate);
    if (parsedSettings) updateData.settings = parsedSettings;

    // Update user และ delete old image พร้อมกัน
    const [updatedUser] = await Promise.allSettled([
      prisma.user.update({
        where: { username: username },
        data: updateData,
        select: {
          id: true,
          username: true,
          name: true,
          bio: true,
          profileImage: true,
          socialLinks: true,
          location: true,
          jobTitle: true,
          company: true,
          education: true,
          email: true,
          phone: true,
          birthDate: true,
          settings: true,
          views: true,
          totalBlogLikes: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              blogs: true,
              followers: true,
              following: true,
              comments: true,
            },
          },
        },
      }),
      // Delete old image in parallel
      profileImageUrl && profileData.oldProfileImage
        ? cloudinary.uploader
            .destroy(profileData.oldProfileImage)
            .catch((err) => {
              console.warn("Failed to delete old profile image:", err);
              return null;
            })
        : Promise.resolve(null),
    ]);

    if (updatedUser.status === "rejected") {
      throw updatedUser.reason;
    }

    const user = updatedUser.value;

    const responseData = {
      ...user,
      _count: {
        ...user._count,
        totalBlogLikes: user.totalBlogLikes,
        views: user.views,
      },
    };

    return createSuccessResponse({
      data: responseData,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return createErrorResponse({
          code: "USERNAME_TAKEN",
          message: "Username already taken",
          status: 409,
        });
      }
      if (error.code === "P2025") {
        return createErrorResponse({
          code: "USER_NOT_FOUND",
          message: "User not found",
          status: 404,
        });
      }
    }

    if (error instanceof SyntaxError) {
      return createErrorResponse({
        code: "INVALID_JSON",
        message: "Invalid JSON format",
        status: 400,
      });
    }

    return createErrorResponse({
      code: "UPDATE_PROFILE_ERROR",
      message: "Error updating profile",
      status: 500,
    });
  }
}
