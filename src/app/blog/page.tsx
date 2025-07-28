// app/blog/page.tsx
"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import PostCardSkeleton from "@/components/blog/post/PostCardSkeleton";
import PostCard from "@/components/blog/post/PostCard";
import MainNavbar from "@/components/layout/Navbar";
import { Search, Filter, Calendar, Tag, SortDesc } from "lucide-react";
import { IPostPreview } from "@/types";

// Mock categories
const categories = [
  { id: "all", name: "ทุกหมวด", count: 25 },
  { id: "javascript", name: "JavaScript", count: 8 },
  { id: "react", name: "React", count: 6 },
  { id: "nextjs", name: "Next.js", count: 4 },
  { id: "css", name: "CSS", count: 3 },
  { id: "typescript", name: "TypeScript", count: 4 },
];

// Mock data - เพิ่มข้อมูลให้มากขึ้น
const mockPosts = [
  {
    id: "1",
    title: "Getting Started with Next.js 14 และ App Router",
    slug: "getting-started-nextjs-14",
    excerpt:
      "เรียนรู้วิธีการใช้งาน Next.js 14 พร้อม App Router และฟีเจอร์ใหม่ๆ ที่น่าสนใจ",
    coverImage:
      "https://wallpapers.com/images/featured/4k-background-fd313fxzl511betu.jpg",
    published: true,
    createdAt: new Date("2024-01-15"),
    category: "nextjs",
    author: {
      name: "John Doe",
      image:
        "https://wallpapers.com/images/featured/4k-background-fd313fxzl511betu.jpg",
    },
    _count: {
      likes: 24,
      comments: 8,
    },
  },
  {
    id: "2",
    title: "Modern CSS Techniques ที่ Developer ควรรู้",
    slug: "modern-css-techniques",
    excerpt:
      "เทคนิค CSS ใหม่ๆ ที่จะทำให้การออกแบบ UI/UX ของคุณดูทันสมัยและใช้งานง่ายขึ้น",
    coverImage:
      "https://wallpapers.com/images/featured/4k-background-fd313fxzl511betu.jpg",
    published: true,
    createdAt: new Date("2024-01-12"),
    category: "css",
    author: {
      name: "Jane Smith",
      image:
        "https://wallpapers.com/images/featured/4k-background-fd313fxzl511betu.jpg",
    },
    _count: {
      likes: 18,
      comments: 5,
    },
  },
  {
    id: "3",
    title: "TypeScript Tips & Tricks สำหรับ React Developer",
    slug: "typescript-tips-react",
    excerpt:
      "เทคนิคการใช้งาน TypeScript กับ React ที่จะช่วยให้โค้ดของคุณปลอดภัยและบำรุงรักษาง่าย",
    coverImage:
      "https://wallpapers.com/images/featured/4k-background-fd313fxzl511betu.jpg",
    published: true,
    createdAt: new Date("2024-01-10"),
    category: "typescript",
    author: {
      name: "Mike Johnson",
      image:
        "https://wallpapers.com/images/featured/4k-background-fd313fxzl511betu.jpg",
    },
    _count: {
      likes: 32,
      comments: 12,
    },
  },
  {
    id: "4",
    title: "React Hooks ที่คุณควรรู้จัก",
    slug: "react-hooks-guide",
    excerpt:
      "เรียนรู้ React Hooks ทั้งหมดที่จำเป็นสำหรับการพัฒนา React Application ในปี 2024",
    coverImage:
      "https://wallpapers.com/images/featured/4k-background-fd313fxzl511betu.jpg",
    published: true,
    createdAt: new Date("2024-01-08"),
    category: "react",
    author: {
      name: "Sarah Wilson",
      image:
        "https://wallpapers.com/images/featured/4k-background-fd313fxzl511betu.jpg",
    },
    _count: {
      likes: 45,
      comments: 15,
    },
  },
  {
    id: "5",
    title: "JavaScript ES2024 Features ที่ต้องรู้",
    slug: "javascript-es2024-features",
    excerpt:
      "ฟีเจอร์ใหม่ใน JavaScript ES2024 ที่จะช่วยให้การเขียนโค้ดของคุณดีขึ้น",
    coverImage:
      "https://wallpapers.com/images/featured/4k-background-fd313fxzl511betu.jpg",
    published: true,
    createdAt: new Date("2024-01-05"),
    category: "javascript",
    author: {
      name: "Alex Chen",
      image:
        "https://wallpapers.com/images/featured/4k-background-fd313fxzl511betu.jpg",
    },
    _count: {
      likes: 28,
      comments: 9,
    },
  },
];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
  const [timeRange, setTimeRange] = useState<"all" | "week" | "month" | "year">(
    "all"
  );

  // Filter และ Search logic
  const filteredPosts = mockPosts.filter((post) => {
    // Search filter
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory =
      selectedCategory === "all" || post.category === selectedCategory;

    // Time range filter
    let matchesTimeRange = true;
    if (timeRange !== "all") {
      const now = new Date();
      const postDate = new Date(post.createdAt);
      const daysDiff = Math.floor(
        (now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      switch (timeRange) {
        case "week":
          matchesTimeRange = daysDiff <= 7;
          break;
        case "month":
          matchesTimeRange = daysDiff <= 30;
          break;
        case "year":
          matchesTimeRange = daysDiff <= 365;
          break;
      }
    }

    return matchesSearch && matchesCategory && matchesTimeRange;
  });

  // Sort logic
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "latest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return b._count.likes - a._count.likes;
    }
  });

  return (
    <>
      <MainNavbar />
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="gradient-text">Blog</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              บทความและเทคนิคการพัฒนาเว็บไซต์สำหรับ Developer
            </p>
          </div>

          {/* Search & Filters */}
          <Card className="glass-card mb-8">
            <CardContent className="p-6">
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="ค้นหาบทความ, ชื่อผู้เขียน..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>

              {/* Filter Options */}
              <div className="space-y-4">
                {/* Categories */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4" />
                    <span className="font-medium">หมวดหมู่</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={
                          selectedCategory === category.id
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                        className="text-sm"
                      >
                        {category.name}
                        <span className="ml-1 text-xs opacity-70">
                          ({category.count})
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Time Range & Sort */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Time Range */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium text-sm">ช่วงเวลา</span>
                    </div>
                    <div className="flex gap-2">
                      {[
                        { value: "all", label: "ทั้งหมด" },
                        { value: "week", label: "สัปดาห์นี้" },
                        { value: "month", label: "เดือนนี้" },
                        { value: "year", label: "ปีนี้" },
                      ].map((option) => (
                        <Button
                          key={option.value}
                          variant={
                            timeRange === option.value ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setTimeRange(option.value as "all" | "week" | "month" | "year")}
                          className="text-sm"
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Sort */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <SortDesc className="w-4 h-4" />
                      <span className="font-medium text-sm">เรียงตาม</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={sortBy === "latest" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSortBy("latest")}
                        className="text-sm"
                      >
                        ล่าสุด
                      </Button>
                      <Button
                        variant={sortBy === "popular" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSortBy("popular")}
                        className="text-sm"
                      >
                        ยอดนิยม
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Info */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-600 dark:text-slate-400">
              {filteredPosts.length === mockPosts.length
                ? `ทั้งหมด ${sortedPosts.length} โพสต์`
                : `พบ ${sortedPosts.length} โพสต์จากทั้งหมด ${mockPosts.length} โพสต์`}
            </p>

            {/* Clear Filters */}
            {(searchQuery ||
              selectedCategory !== "all" ||
              timeRange !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setTimeRange("all");
                }}
                className="text-sm"
              >
                ล้างตัวกรอง
              </Button>
            )}
          </div>

          {/* Posts Grid */}
          {sortedPosts.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Suspense fallback={<PostCardSkeleton />}>
                  {sortedPosts.map((post) => (
                    <PostCard key={post.id} post={post as IPostPreview} />
                  ))}
                </Suspense>
              </div>

              {/* Load More */}
              <div className="text-center mt-12">
                <Button variant="outline" size="lg" className="glass-card">
                  โหลดเพิ่มเติม
                </Button>
              </div>
            </>
          ) : (
            // No Results
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <Search className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <h3 className="text-xl font-semibold mb-2">
                  ไม่พบบทความที่ตรงกับการค้นหา
                </h3>
                <p className="text-slate-500 mb-4">
                  ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองเพื่อค้นหาบทความที่คุณสนใจ
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="text-sm text-slate-400">คำแนะนำ:</span>
                  {["JavaScript", "React", "Next.js", "CSS"].map(
                    (suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchQuery(suggestion);
                          setSelectedCategory("all");
                        }}
                        className="text-sm"
                      >
                        {suggestion}
                      </Button>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
