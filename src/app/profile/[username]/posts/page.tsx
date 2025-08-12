// app/profile/[username]/blogs/page.tsx (Optional - สำหรับดูโพสต์ทั้งหมด)
"use client"
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import BlogCard from "@/components/blog/BlogCard";
import BlogCardSkeleton from "@/components/blog/BlogCardSkeleton";

import { ArrowLeft, FileText } from "lucide-react";
import { IBlog } from "@/types/blog";
import { SmartNavigation } from "@/components/Navbar/SmartNavbar";

interface UserBlogsPageProps {
  params: {
    username: string;
  };
}
const mockUserProfile = {
  id: "user123",
  username: "johndoe",
  displayName: "John Doe",
  bio: "Full-stack Developer passionate about React, Next.js, and TypeScript. Love sharing knowledge through writing and open source contributions.",
  avatar:
    "",
  location: "Bangkok, Thailand",
  website: "https://johndoe.dev",
  socialLinks: {
    twitter: "https://twitter.com/johndoe",
    github: "https://github.com/johndoe",
  },
  createdAt: new Date("2023-01-15"),
  _count: {
    blogs: 24,
    followers: 1250,
    following: 180,
  },
};

// Mock user's blogs
const mockUserBlogs = [
  {
    id: "1",
    title: "Getting Started with Next.js 14 และ App Router",
    slug: "getting-started-nextjs-14",
    excerpt:
      "เรียนรู้วิธีการใช้งาน Next.js 14 พร้อม App Router และฟีเจอร์ใหม่ๆ ที่น่าสนใจ",
    coverImage:
      "",
    published: true,
    createdAt: new Date("2024-01-15"),
    author: mockUserProfile,
    _count: {
      likes: 24,
      comments: 8,
    },
  },
  {
    id: "2",
    title: "TypeScript Tips & Tricks สำหรับ React Developer",
    slug: "typescript-tips-react",
    excerpt:
      "เทคนิคการใช้งาน TypeScript กับ React ที่จะช่วยให้โค้ดของคุณปลอดภัยและบำรุงรักษาง่าย",
    coverImage:
      "",
    published: true,
    createdAt: new Date("2024-01-10"),
    author: mockUserProfile,
    _count: {
      likes: 32,
      comments: 12,
    },
  },
];

export default function UserBlogsPage({ params }: UserBlogsPageProps) {
  // ในการใช้งานจริงจะดึงข้อมูลจาก API
  const userProfile = mockUserProfile;
  const userBlogs = mockUserBlogs;

  return (
    <>
      <SmartNavigation />
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button asChild variant="ghost" className="mb-4">
              <Link href={`/profile/${params.username}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับไปโปรไฟล์
              </Link>
            </Button>

            <h1 className="text-3xl font-bold mb-2">
              บล็อกทั้งหมดของ {userProfile.displayName}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              รวม {userBlogs.length} โพสต์
            </p>
          </div>

          {/* Blogs Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Suspense fallback={<BlogCardSkeleton />}>
              {userBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog as IBlog} />
              ))}
            </Suspense>
          </div>

          {/* Pagination */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="glass-card">
              โหลดเพิ่มเติม
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
