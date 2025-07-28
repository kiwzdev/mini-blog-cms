// app/profile/[username]/page.tsx
"use client";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/blog/post/PostCard";
import PostCardSkeleton from "@/components/blog/post/PostCardSkeleton";
import MainNavbar from "@/components/layout/MainNavbar";
import { formatDate } from "@/lib/utils";
import {
  Calendar,
  MapPin,
  Link as LinkIcon,
  Github,
  Twitter,
  FileText,
  Heart,
  MessageCircle,
} from "lucide-react";
import { IPostPreview } from "@/types";

// Mock user profile data
const mockUserProfile = {
  id: "user123",
  username: "johndoe",
  displayName: "John Doe",
  bio: "Full-stack Developer passionate about React, Next.js, and TypeScript. Love sharing knowledge through writing and open source contributions.",
  avatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
  location: "Bangkok, Thailand",
  website: "https://johndoe.dev",
  socialLinks: {
    twitter: "https://twitter.com/johndoe",
    github: "https://github.com/johndoe",
  },
  createdAt: new Date("2023-01-15"),
  _count: {
    posts: 24,
    followers: 1250,
    following: 180,
  },
};

// Mock user's posts
const mockUserPosts = [
  {
    id: "1",
    title: "Getting Started with Next.js 14 และ App Router",
    slug: "getting-started-nextjs-14",
    excerpt:
      "เรียนรู้วิธีการใช้งาน Next.js 14 พร้อม App Router และฟีเจอร์ใหม่ๆ ที่น่าสนใจ",
    coverImage:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop",
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
      "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop",
    published: true,
    createdAt: new Date("2024-01-10"),
    author: mockUserProfile,
    _count: {
      likes: 32,
      comments: 12,
    },
  },
  {
    id: "3",
    title: "Building Modern UI with Tailwind CSS",
    slug: "modern-ui-tailwind",
    excerpt:
      "สร้าง UI ที่สวยงามและ responsive ด้วย Tailwind CSS และเทคนิคที่ใช้ในโปรเจกต์จริง",
    coverImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop",
    published: true,
    createdAt: new Date("2024-01-05"),
    author: mockUserProfile,
    _count: {
      likes: 18,
      comments: 5,
    },
  },
];

interface ProfilePageProps {
  params: {
    username: string;
  };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  // ในการใช้งานจริงจะดึงข้อมูลจาก API
  // const userProfile = await getUserByUsername(params.username);
  // const userPosts = await getPostsByAuthor(userProfile.id);
  // if (!userProfile) notFound();

  const userProfile = mockUserProfile;
  const userPosts = mockUserPosts;

  return (
    <>
      <MainNavbar />
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <Card className="glass-card mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar & Basic Info */}
                <div className="flex flex-col items-center md:items-start gap-4">
                  <div className="relative">
                    <Image
                      src={userProfile.avatar}
                      alt={userProfile.displayName}
                      width={120}
                      height={120}
                      className="rounded-full border-4 border-white/50 shadow-lg"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-white rounded-full"></div>
                  </div>

                  {/* Follow Button - จะแสดงเฉพาะเมื่อไม่ใช่โปรไฟล์ตัวเอง */}
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Follow
                  </Button>
                </div>

                {/* Profile Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">
                      {userProfile.displayName}
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                      @{userProfile.username}
                    </p>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {userProfile.bio}
                  </p>

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                    {userProfile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {userProfile.location}
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      เข้าร่วมเมื่อ {formatDate(userProfile.createdAt)}
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex gap-3">
                    {userProfile.website && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={userProfile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Website
                        </a>
                      </Button>
                    )}

                    {userProfile.socialLinks?.github && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={userProfile.socialLinks.github}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Github className="w-4 h-4 mr-2" />
                          GitHub
                        </a>
                      </Button>
                    )}

                    {userProfile.socialLinks?.twitter && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={userProfile.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Twitter className="w-4 h-4 mr-2" />
                          Twitter
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex md:flex-col gap-6 md:gap-4 justify-center md:justify-start">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {userProfile._count.posts}
                    </div>
                    <div className="text-sm text-slate-500">โพสต์</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {userProfile._count.followers.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-500">Followers</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {userProfile._count.following}
                    </div>
                    <div className="text-sm text-slate-500">Following</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="w-6 h-6" />
                บล็อกของ {userProfile.displayName}
              </h2>
              <div className="text-sm text-slate-500">
                {userPosts.length} โพสต์
              </div>
            </div>

            {userPosts.length > 0 ? (
              <>
                {/* Posts Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <Suspense fallback={<PostCardSkeleton />}>
                    {userPosts.map((post) => (
                      <PostCard key={post.id} post={post as IPostPreview} />
                    ))}
                  </Suspense>
                </div>

                {/* Load More - จะแสดงเมื่อมีโพสต์เยอะ */}
                {userPosts.length >= 6 && (
                  <div className="text-center mt-12">
                    <Button variant="outline" size="lg" className="glass-card">
                      โหลดเพิ่มเติม
                    </Button>
                  </div>
                )}
              </>
            ) : (
              // Empty State
              <Card className="glass-card">
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                  <h3 className="text-xl font-semibold mb-2">ยังไม่มีบล็อก</h3>
                  <p className="text-slate-500">
                    {userProfile.displayName} ยังไม่ได้เขียนบล็อกใดๆ
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
