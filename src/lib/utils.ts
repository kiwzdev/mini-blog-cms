import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDistanceToNow(date: Date): string {
 const now = new Date();
 const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
 
 if (diffInSeconds < 60) {
   return 'เมื่อสักครู่';
 }
 
 const diffInMinutes = Math.floor(diffInSeconds / 60);
 if (diffInMinutes < 60) {
   return `${diffInMinutes} นาทีที่แล้ว`;
 }
 
 const diffInHours = Math.floor(diffInMinutes / 60);
 if (diffInHours < 24) {
   return `${diffInHours} ชั่วโมงที่แล้ว`;
 }
 
 const diffInDays = Math.floor(diffInHours / 24);
 if (diffInDays < 7) {
   return `${diffInDays} วันที่แล้ว`;
 }
 
 const diffInWeeks = Math.floor(diffInDays / 7);
 if (diffInWeeks < 4) {
   return `${diffInWeeks} สัปดาห์ที่แล้ว`;
 }
 
 const diffInMonths = Math.floor(diffInDays / 30);
 if (diffInMonths < 12) {
   return `${diffInMonths} เดือนที่แล้ว`;
 }
 
 const diffInYears = Math.floor(diffInDays / 365);
 return `${diffInYears} ปีที่แล้ว`;
}