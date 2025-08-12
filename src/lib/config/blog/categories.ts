// lib/config/categories.ts
import {
  Code,
  Heart,
  Camera,
  Utensils,
  Plane,
  BookOpen,
  Gamepad2,
  Music,
  Palette,
  Briefcase,
  LucideProps,
} from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  color: string;
  description?: string;
  slug: string;
}

export const BLOG_CATEGORIES: Category[] = [
    {
    id: "all",
    name: "ทั้งหมด",
    nameEn: "All",
    icon: BookOpen,
    color: "bg-gray-400",
    description: "แสดงบทความทุกหมวดหมู่",
    slug: "all",
  },
  {
    id: "technology",
    name: "เทคโนโลยี",
    nameEn: "Technology",
    icon: Code,
    color: "bg-blue-500",
    description: "เทคโนโลยี AI, การพัฒนา, และนวัตกรรม",
    slug: "technology",
  },
  {
    id: "lifestyle",
    name: "ไลฟ์สไตล์",
    nameEn: "Lifestyle",
    icon: Heart,
    color: "bg-pink-500",
    description: "การใช้ชีวิต สุขภาพ และความงาม",
    slug: "lifestyle",
  },
  {
    id: "food",
    name: "อาหาร",
    nameEn: "Food",
    icon: Utensils,
    color: "bg-orange-500",
    description: "อาหาร สูตรอาหาร และร้านอาหารแนะนำ",
    slug: "food",
  },
  {
    id: "travel",
    name: "ท่องเที่ยว",
    nameEn: "Travel",
    icon: Plane,
    color: "bg-green-500",
    description: "การท่องเที่ยว สถานที่น่าเที่ยว",
    slug: "travel",
  },
  {
    id: "photography",
    name: "การถ่ายภาพ",
    nameEn: "Photography",
    icon: Camera,
    color: "bg-purple-500",
    description: "เทคนิคการถ่ายภาพ และอุปกรณ์",
    slug: "photography",
  },
  {
    id: "education",
    name: "การศึกษา",
    nameEn: "Education",
    icon: BookOpen,
    color: "bg-indigo-500",
    description: "การเรียนรู้ หลักสูตร และทักษะใหม่",
    slug: "education",
  },
  {
    id: "gaming",
    name: "เกม",
    nameEn: "Gaming",
    icon: Gamepad2,
    color: "bg-red-500",
    description: "เกม รีวิวเกม และข่าวสารเกม",
    slug: "gaming",
  },
  {
    id: "music",
    name: "ดนตรี",
    nameEn: "Music",
    icon: Music,
    color: "bg-yellow-500",
    description: "ดนตรี ศิลปิน และเครื่องมือดนตรี",
    slug: "music",
  },
  {
    id: "design",
    name: "ดีไซน์",
    nameEn: "Design",
    icon: Palette,
    color: "bg-teal-500",
    description: "UI/UX ดีไซน์กราฟิก และศิลปะ",
    slug: "design",
  },
  {
    id: "business",
    name: "ธุรกิจ",
    nameEn: "Business",
    icon: Briefcase,
    color: "bg-gray-600",
    description: "ธุรกิจ การลงทุน และการเงิน",
    slug: "business",
  },
];

// Helper functions
export const getCategoryById = (id: string): Category | undefined => {
  return BLOG_CATEGORIES.find((cat) => cat.id === id);
};

export const getCategoryBySlug = (slug: string): Category | undefined => {
  return BLOG_CATEGORIES.find((cat) => cat.slug === slug);
};

export const getCategoriesForSelect = () => {
  return BLOG_CATEGORIES.map((cat) => ({
    value: cat.id,
    label: cat.name,
    icon: cat.icon,
    color: cat.color,
  }));
};

// lib/config/site.ts
export const SITE_CONFIG = {
  name: "My Blog",
  description: "แชร์ความรู้และประสบการณ์ผ่านบล็อก",
  url: "https://myblog.com",
  ogImage: "https://myblog.com/og.jpg",
  links: {
    twitter: "https://twitter.com/myblog",
    github: "https://github.com/myblog",
    facebook: "https://facebook.com/myblog",
  },
  author: {
    name: "Blog Author",
    email: "author@myblog.com",
    twitter: "@author",
  },
};

// lib/config/editor.ts
export const EDITOR_CONFIG = {
  markdown: {
    defaultValue: "# เริ่มเขียนบล็อกของคุณ...\n\n",
    placeholder: "เขียนเนื้อหาของคุณที่นี่...",
    toolbar: [
      "bold",
      "italic",
      "strikethrough",
      "|",
      "heading-1",
      "heading-2",
      "heading-3",
      "|",
      "unordered-list",
      "ordered-list",
      "|",
      "link",
      "image",
      "code",
      "quote",
      "|",
      "preview",
      "side-by-side",
      "fullscreen",
    ],
    spellChecker: false,
    status: false,
  },
  richText: {
    placeholder: "เริ่มเขียนเนื้อหาของคุณ...",
    menubar: false,
    plugins: [
      "advlist",
      "autolink",
      "lists",
      "link",
      "image",
      "charmap",
      "anchor",
      "searchreplace",
      "visualblocks",
      "code",
      "fullscreen",
      "insertdatetime",
      "media",
      "table",
      "preview",
      "help",
      "wordcount",
    ],
    toolbar:
      "undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
  },
};

// lib/config/blog.ts
export const BLOG_CONFIG = {
  excerptLength: 150,
  slugMaxLength: 100,
  titleMaxLength: 200,
  contentMinLength: 100,
  defaultCoverImage: "/images/default-cover.jpg",
  imageUpload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    uploadPath: "/uploads/images/",
  },
};

// lib/config/ui.ts
export const UI_CONFIG = {
  theme: {
    defaultTheme: "light",
    themes: ["light", "dark", "system"],
  },
  layout: {
    maxWidth: "6xl",
    sidebarWidth: "w-80",
    headerHeight: "h-16",
  },
  animation: {
    duration: "duration-200",
    easing: "ease-in-out",
  },
  colors: {
    primary: "blue",
    secondary: "purple",
    accent: "pink",
    neutral: "gray",
  },
};

// lib/config/api.ts
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  timeout: 10000,
  retries: 3,
  endpoints: {
    blogs: "/blogs",
    categories: "/categories",
    users: "/users",
    auth: "/auth",
    upload: "/upload",
  },
};

// lib/config/seo.ts
export const SEO_CONFIG = {
  defaultTitle: "My Blog - แชร์ความรู้และประสบการณ์",
  titleTemplate: "%s | My Blog",
  defaultDescription: "แชร์ความรู้และประสบการณ์ผ่านบล็อกคุณภาพ",
  siteUrl: "https://myblog.com",
  defaultImage: "/images/og-default.jpg",
  twitter: {
    handle: "@myblog",
    site: "@myblog",
    cardType: "summary_large_image",
  },
};

// lib/config/validation.ts
export const VALIDATION_CONFIG = {
  blog: {
    title: {
      minLength: 5,
      maxLength: 200,
    },
    content: {
      minLength: 100,
      maxLength: 50000,
    },
    excerpt: {
      maxLength: 300,
    },
    slug: {
      maxLength: 100,
      pattern: /^[a-z0-9-]+$/,
    },
  },
  user: {
    name: {
      minLength: 2,
      maxLength: 50,
    },
    email: {
      pattern: /^\S+@\S+\.\S+$/,
    },
  },
};
