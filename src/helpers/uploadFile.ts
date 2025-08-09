// กำหนดขนาดไฟล์สูงสุด (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Validate file type
export function isValidImageType(file: File): boolean {
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  return validTypes.includes(file.type);
}