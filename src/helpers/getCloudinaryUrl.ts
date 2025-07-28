export const getCloudinaryUrl = (
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    /** ระบุ format ที่ต้องการ เช่น 'jpg', 'png', 'webp' หรือปล่อยว่างเพื่อใช้ 'auto' */
    format?: string;
    /** ระบุ quality ที่ต้องการ หรือปล่อยว่างเพื่อใช้ 'auto' */
    quality?: string | "auto";
    /** ระบุ crop mode เช่น 'fill', 'fit', 'scale' */
    crop?: "fill" | "fit" | "scale" | "thumb";
  }
) => {
  //  !!! สำคัญมาก: เปลี่ยนเป็น Cloud Name ของคุณ !!!
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;

  if (!publicId) {
    // ส่งคืน URL ของภาพสำรองหรือ null หากไม่มี publicId
    return "https://path.to/your/default/placeholder-image.png";
  }

  const transformations: string[] = [];

  // 1. ขนาดและ Crop
  if (options?.width) transformations.push(`w_${options.width}`);
  if (options?.height) transformations.push(`h_${options.height}`);
  if (options?.width || options?.height) {
    // c_fill จะทำให้ภาพเต็มพื้นที่ตาม w, h โดยอาจมีการตัดบางส่วนออก
    transformations.push(`c_${options.crop || "fill"}`);
  }

  // 2. คุณภาพ (Best Practice: q_auto)
  transformations.push(`q_${options?.quality || "auto"}`);

  // 3. Format (Best Practice: f_auto)
  transformations.push(`f_${options?.format || "auto"}`);

  const transformationStr = transformations.join(",");

  // โครงสร้าง URL ที่ถูกต้องคือ:
  // .../image/upload/{transformations}/{publicId}
  // ไม่ต้องมี .format ต่อท้าย publicId
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformationStr}/${publicId}`;
};
