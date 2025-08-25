// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { extractPublicIdFromUrl } from "@/lib/image/cloudinary";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { isValidImageType, MAX_FILE_SIZE } from "@/helpers/uploadFile";

// Upload File - Optimized
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const oldPublicId = formData.get("oldPublicId") as string;

    // Early validation
    if (!file) {
      return createErrorResponse({
        code: "NO_FILE",
        message: "No file provided",
        status: 400,
      });
    }

    if (file.size > MAX_FILE_SIZE) {
      return createErrorResponse({
        code: "FILE_TOO_LARGE",
        message: `File size too large. Maximum size is ${
          MAX_FILE_SIZE / (1024 * 1024)
        }MB`,
        status: 400,
      });
    }

    if (!isValidImageType(file)) {
      return createErrorResponse({
        code: "INVALID_FILE_TYPE",
        message: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed",
        status: 400,
      });
    }

    console.log(
      `Uploading file: ${file.name}, size: ${(file.size / 1024).toFixed(2)}KB`
    );

    const startTime = Date.now();

    // Memory-efficient file conversion using streams
    const bytes = new Uint8Array(await file.arrayBuffer());
    const base64 = Buffer.from(bytes).toString("base64");
    const dataURI = `data:${file.type};base64,${base64}`;

    const bufferTime = Date.now() - startTime;
    console.log(`Buffer conversion took: ${bufferTime}ms`);

    const uploadStartTime = Date.now();

    // Optimized upload configuration
    const uploadOptions = {
      folder: "mini-blog",
      resource_type: "auto" as const,
      unique_filename: true,
      overwrite: false,
      // ปรับ transformation ให้เหมาะสม
      transformation: [
        {
          width: 800,
          height: 800,
          crop: "limit",
          quality: "auto:good",
          format: "auto",
          fetch_format: "auto",
        },
      ],
      // ใช้ responsive breakpoints แทน eager transformation
      responsive_breakpoints: {
        create_derived: true,
        bytes_step: 20000,
        min_width: 200,
        max_width: 1000,
        transformation: {
          crop: "scale",
          quality: "auto:good",
        },
      },
    };

    // Parallel operations: upload และ delete old image
    const uploadPromise = cloudinary.uploader.upload(dataURI, uploadOptions);

    // Delete old image in parallel (if exists)
    const deletePromise = oldPublicId
      ? cloudinary.uploader.destroy(oldPublicId).catch((err) => {
          console.error("Failed to delete old image:", err);
          // Don't fail the upload if delete fails
          return null;
        })
      : Promise.resolve(null);

    // Wait for both operations
    const [uploadRes, deleteRes] = await Promise.allSettled([
      uploadPromise,
      deletePromise,
    ]);

    const uploadTime = Date.now() - uploadStartTime;
    console.log(`Cloudinary operations took: ${uploadTime}ms`);

    // Handle upload result
    if (uploadRes.status === "rejected") {
      throw uploadRes.reason;
    }

    const result = uploadRes.value;
    const totalTime = Date.now() - startTime;

    console.log(`Total upload time: ${totalTime}ms`);

    if (deleteRes.status === "fulfilled" && oldPublicId) {
      console.log("Old image deleted:", oldPublicId);
    }

    // Clean response data
    return createSuccessResponse({
      message: "File uploaded successfully",
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        // เพิ่ม responsive URLs สำหรับ optimization
        responsiveUrls:
          result.responsive_breakpoints?.[0]?.breakpoints?.map((bp: any) => ({
            width: bp.width,
            url: bp.secure_url,
          })) || [],
        uploadTime: totalTime,
      },
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return createErrorResponse({
      code: "UPLOAD_ERROR",
      message: "Failed to upload file",
      status: 500,
    });
  }
}

// Delete File - Optimized with better error handling
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("url");
    const publicId = searchParams.get("publicId");

    // Determine public ID
    const targetPublicId =
      publicId || (imageUrl ? extractPublicIdFromUrl(imageUrl) : null);

    if (!targetPublicId) {
      return createErrorResponse({
        code: "NO_PUBLIC_ID",
        message: "No public ID or valid URL provided",
        status: 400,
      });
    }

    console.log(`Deleting image with publicId: ${targetPublicId}`);
    const startTime = Date.now();

    // Delete with timeout
    const deleteRes = (await Promise.race([
      cloudinary.uploader.destroy(targetPublicId),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Delete timeout")), 10000)
      ),
    ])) as any;

    const deleteTime = Date.now() - startTime;
    console.log(`Delete operation took: ${deleteTime}ms`);

    if (deleteRes.result === "ok" || deleteRes.result === "not found") {
      return createSuccessResponse({
        message:
          deleteRes.result === "not found"
            ? "Image was already deleted or not found"
            : "Image deleted successfully",
        data: {
          publicId: targetPublicId,
          result: deleteRes.result,
        },
      });
    }

    return createErrorResponse({
      code: "DELETE_FAILED",
      message: "Failed to delete image",
      status: 400,
      details: deleteRes.result,
    });
  } catch (error) {
    console.error("Error deleting image:", error);

    if (error instanceof Error && error.message === "Delete timeout") {
      return createErrorResponse({
        code: "DELETE_TIMEOUT",
        message: "Delete operation timed out",
        status: 408,
      });
    }

    return createErrorResponse({
      code: "DELETE_ERROR",
      message: "Failed to delete image",
      status: 500,
    });
  }
}
