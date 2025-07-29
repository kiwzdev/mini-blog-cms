import { getCloudinaryUrl } from "./cloudinary";

function normalizeUrl(url: string) {
  if (!url.startsWith("http")) {
    return "https://" + url;
  }
  return url;
}

export function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(normalizeUrl(url));
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      !!parsed.hostname.includes(".") // กันกรณี "http://a"
    );
  } catch {
    return false;
  }
}

export function getImageUrl(url: string): string {
  // ตรวจสอบว่าเป็น full URL หรือไม่
  if (isValidHttpUrl(url)) {
    return url;
  }

  // ถ้าไม่ใช่ full URL ให้ถือว่าเป็น Cloudinary public_id
  return getCloudinaryUrl(url);
}
