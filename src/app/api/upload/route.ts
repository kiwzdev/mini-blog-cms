// app/api/upload/route.ts
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { extractPublicIdFromUrl } from "@/lib/image/cloudinary";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";

// กำหนดขนาดไฟล์สูงสุด (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Validate file type
function isValidImageType(file: File): boolean {
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  return validTypes.includes(file.type);
}

// Upload File
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const oldPublicId = formData.get("oldPublicId") as string;

    if (!file) {
      return createErrorResponse({
        code: "NO_FILE",
        message: "No file provided",
        status: 400,
      });
    }

    // ตรวจสอบขนาดไฟล์
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File size too large. Maximum size is ${
            MAX_FILE_SIZE / (1024 * 1024)
          }MB`,
        },
        { status: 400 }
      );
    }

    // ตรวจสอบประเภทไฟล์
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

    // แปลงไฟล์เป็น base64 แบบ optimized
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataURI = `data:${file.type};base64,${base64}`;

    const bufferTime = Date.now() - startTime;
    console.log(`Buffer conversion took: ${bufferTime}ms`);

    // Upload ไปยัง Cloudinary พร้อม optimization
    const uploadStartTime = Date.now();

    const uploadRes = await cloudinary.uploader.upload(dataURI, {
      folder: "mini-blog",
      // ลด transformation ให้เหลือแค่จำเป็น
      transformation: [
        {
          width: 500,
          height: 500,
          crop: "limit",
          quality: "auto:good",
          format: "auto",
        },
      ],
      // เพิ่ม options เพื่อเพิ่มความเร็ว
      resource_type: "auto",
      unique_filename: true,
      overwrite: false,
      // ใช้ eager transformation สำหรับ thumbnail
      eager: [{ width: 150, height: 150, crop: "thumb", quality: "auto:low" }],
      eager_async: true, // ทำ eager transformation แบบ async
    });

    const uploadTime = Date.now() - uploadStartTime;
    console.log(`Cloudinary upload took: ${uploadTime}ms`);

    // ลบรูปเก่าแบบ async (ไม่ต้องรอ)
    if (oldPublicId) {
      // ใช้ Promise.resolve().then() เพื่อทำแบบ async
      Promise.resolve().then(async () => {
        try {
          await cloudinary.uploader.destroy(oldPublicId);
          console.log("Old image deleted:", oldPublicId);
        } catch (err) {
          console.error("Failed to delete old image:", err);
        }
      });
    }

    const totalTime = Date.now() - startTime;
    console.log(`Total upload time: ${totalTime}ms`);

    console.log("Upload result:", uploadRes);
    return createSuccessResponse({
      message: "File uploaded successfully",
      data: {
        url: uploadRes.secure_url,
        publicId: uploadRes.public_id,
        width: uploadRes.width,
        height: uploadRes.height,
        format: uploadRes.format,
        bytes: uploadRes.bytes,
        // เพิ่มข้อมูลเพื่อ debug
        uploadTime: totalTime,
        thumbnail: uploadRes.eager?.[0]?.secure_url || null,
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

// Delete File (optimized)
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("url");
    const publicId = searchParams.get("publicId");

    let targetPublicId = publicId;

    if (!targetPublicId && imageUrl) {
      targetPublicId = extractPublicIdFromUrl(imageUrl);
    }

    if (!targetPublicId) {
      return createErrorResponse({
        code: "NO_PUBLIC_ID",
        message: "No public ID or valid URL provided",
        status: 400,
      });
    }

    const deleteRes = await cloudinary.uploader.destroy(targetPublicId || "");

    if (deleteRes.result === "ok") {
      return createSuccessResponse({
        message: "Image deleted successfully",
        data: {
          publicId: targetPublicId,
        },
      });
    } else {
      return createErrorResponse({
        code: "DELETE_ERROR",
        message: "Failed to delete image",
        status: 400,
        details: deleteRes.result,
      });
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    return createErrorResponse({
      code: "DELETE_ERROR",
      message: "Failed to delete image",
      status: 500,
    });
  }
}
