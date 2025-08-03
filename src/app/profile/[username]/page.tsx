// app/profile/[username]/page.tsx
"use client";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BlogCard from "@/components/blog/BlogCard";
import BlogCardSkeleton from "@/components/blog/BlogCardSkeleton";
import MainNavbar from "@/components/layout/Navbar";
import { formatDate, formatDistanceToNow } from "@/lib/utils";
import {
  Calendar,
  MapPin,
  Link as LinkIcon,
  Github,
  Twitter,
  FileText,
  Heart,
  MessageCircle,
  Instagram,
  Linkedin,
  Globe,
  Briefcase,
  Edit,
  UserPlus,
  Check,
  RefreshCw,
  Plus,
} from "lucide-react";
import { IBlogCard } from "@/types/blog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock user profile data
const mockUserProfile = {
  id: "user_12345",
  username: "somchai_dev",
  name: "สมชาย นักพัฒนา",
  bio: "Full-stack Developer ที่หลงใหลในการสร้างสรรค์เว็บแอปพลิเคชันและเทคโนโลยีใหม่ๆ ชอบแบ่งปันความรู้และเรียนรู้สิ่งใหม่ตลอดเวลา 💻✨",
  profileImage: "/images/avatars/somchai.jpg",
  coverImage: "/images/covers/tech-workspace.jpg",
  socialLinks: {
    website: "https://somchai.dev",
    github: "https://github.com/somchai-dev",
    twitter: "https://twitter.com/somchai_dev",
    linkedin: "https://linkedin.com/in/somchai-dev",
    instagram: "https://instagram.com/somchai.codes",
  },
  location: "กรุงเทพมหานคร, ประเทศไทย",
  jobTitle: "Senior Full-stack Developer",
  company: "TechCorp Thailand",
  education: "วิทยาการคอมพิวเตร์ จุฬาลงกรณ์มหาวิทยาลัย",
  status: "active",
  badge: "creator",
  createdAt: new Date("2022-03-15T10:30:00Z"),
  lastActiveAt: new Date("2024-01-15T14:20:00Z"),

  // Private fields (จะแสดงเฉพาะเจ้าของ)
  email: "somchai@example.com",
  phone: "+66812345678",
  birthDate: new Date("1995-08-22"),
  settings: {
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    allowComments: true,
  },

  // Stats
  _count: {
    blogs: 47,
    followers: 2850,
    following: 312,
    blogLikes: 15420,
    views: 89750,
    comments: 1240,
  },

  // Analytics (เฉพาะเจ้าของ)
  analytics: {
    profileViews: 12580,
    totalEngagement: 18690,
    averageReadTime: 3.2,
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
    coverImage: "",
    published: true,
    createdAt: new Date("2024-01-15"),
    author: mockUserProfile,
    _count: {
      likes: 24,
      comments: 8,
    },
    isLiked: false,
  },
  {
    id: "2",
    title: "TypeScript Tips & Tricks สำหรับ React Developer",
    slug: "typescript-tips-react",
    excerpt:
      "เทคนิคการใช้งาน TypeScript กับ React ที่จะช่วยให้โค้ดของคุณปลอดภัยและบำรุงรักษาง่าย",
    coverImage: "",
    published: true,
    createdAt: new Date("2024-01-10"),
    author: mockUserProfile,
    _count: {
      likes: 32,
      comments: 12,
    },
    isLiked: true,
  },
];

interface ProfilePageProps {
  params: {
    username: string;
  };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const userProfile = mockUserProfile;
  const userBlogs = mockUserBlogs;
  const isOwnProfile = false; // จะต้องเช็คจาก auth
  const isFollowing = false; // จะต้องเช็คจาก API

  return (
    <>
      <MainNavbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Profile Header */}
          <Card className="glass-card mb-8 border-0 shadow-xl">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Left: Avatar & Quick Actions */}
                <div className="flex flex-col justify-evenly lg:items-start gap-4">
                  <div className="relative mx-auto ">
                    <div className="relative w-32 h-32 md:w-40 md:h-40">
                      <Image
                        src={userProfile.profileImage || "/default-avatar.png"}
                        alt={userProfile.name}
                        fill
                        className="rounded-full border-4 border-white/80 shadow-lg object-cover"
                      />
                      {/* Online Status */}
                      {userProfile.lastActiveAt && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-3 border-white rounded-full"></div>
                      )}
                      {/* Verification Badge */}
                      {userProfile.isVerified && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {!isOwnProfile && (
                    <div className="mx-auto ">
                      <Button
                        size="sm"
                        className={`min-w-[100px] transition-all duration-200 ${
                          isFollowing
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105"
                        }`}
                      >
                        {isFollowing ? "" : <UserPlus className="w-4 h-4 mr-2" />}
                        {isFollowing ? "Following" : "Follow"}
                      </Button>
                    </div>
                  )}

                  {isOwnProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-w-[120px]"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      แก้ไขโปรไฟล์
                    </Button>
                  )}
                </div>

                {/* Center: Profile Info */}
                <div className="flex-1 space-y-4">
                  <div className="text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                        {userProfile.name}
                      </h1>
                      {userProfile.badge && (
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            userProfile.badge === "creator"
                              ? "bg-purple-100 text-purple-700"
                              : userProfile.badge === "pro"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {userProfile.badge.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">
                      @{userProfile.username}
                    </p>

                    {/* Job Title & Company */}
                    {(userProfile.jobTitle || userProfile.company) && (
                      <div className="flex items-center justify-center lg:justify-start gap-1 text-slate-600 dark:text-slate-400 mb-2">
                        <Briefcase className="w-4 h-4" />
                        <span>
                          {userProfile.jobTitle}
                          {userProfile.jobTitle &&
                            userProfile.company &&
                            " ที่ "}
                          {userProfile.company}
                        </span>
                      </div>
                    )}
                  </div>

                  {userProfile.bio && (
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-center lg:text-left">
                      {userProfile.bio}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-slate-600 dark:text-slate-400">
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

                    {userProfile.lastActiveAt && (
                      <div className="flex items-center gap-1 text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        ออนไลน์ล่าสุด{" "}
                        {formatDistanceToNow(userProfile.lastActiveAt)}
                      </div>
                    )}
                  </div>

                  {/* Social Links */}
                  {userProfile.socialLinks &&
                    Object.keys(userProfile.socialLinks).length > 0 && (
                      <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                        {userProfile.socialLinks.website && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="hover:bg-slate-50"
                          >
                            <a
                              href={userProfile.socialLinks.website}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Globe className="w-4 h-4 mr-2" />
                              Website
                            </a>
                          </Button>
                        )}

                        {userProfile.socialLinks.github && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="hover:bg-slate-50"
                          >
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

                        {userProfile.socialLinks.twitter && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="hover:bg-slate-50"
                          >
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

                        {userProfile.socialLinks.linkedin && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="hover:bg-slate-50"
                          >
                            <a
                              href={userProfile.socialLinks.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Linkedin className="w-4 h-4 mr-2" />
                              LinkedIn
                            </a>
                          </Button>
                        )}

                        {userProfile.socialLinks.instagram && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="hover:bg-slate-50"
                          >
                            <a
                              href={userProfile.socialLinks.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Instagram className="w-4 h-4 mr-2" />
                              Instagram
                            </a>
                          </Button>
                        )}
                      </div>
                    )}
                </div>

                {/* Right: Stats */}
                <div className="flex lg:flex-col gap-6 lg:gap-4 justify-center lg:justify-start lg:min-w-[120px]">
                  <div className="text-center group cursor-pointer">
                    <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {userProfile._count.blogs.toLocaleString()}
                    </div>
                    <div className="text-xs md:text-sm text-slate-500">
                      โพสต์
                    </div>
                  </div>

                  <div className="text-center group cursor-pointer">
                    <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {userProfile._count.followers.toLocaleString()}
                    </div>
                    <div className="text-xs md:text-sm text-slate-500">
                      Followers
                    </div>
                  </div>

                  <div className="text-center group cursor-pointer">
                    <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {userProfile._count.following.toLocaleString()}
                    </div>
                    <div className="text-xs md:text-sm text-slate-500">
                      Following
                    </div>
                  </div>

                  <div className="text-center group cursor-pointer">
                    <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {userProfile._count.blogLikes.toLocaleString()}
                    </div>
                    <div className="text-xs md:text-sm text-slate-500">
                      Likes
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Bar (เฉพาะเจ้าของ) */}
              {isOwnProfile && userProfile.analytics && (
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-blue-600">
                        {userProfile.analytics.profileViews.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        Profile Views
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-green-600">
                        {userProfile.analytics.totalEngagement.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        Total Engagement
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-purple-600">
                        {userProfile.analytics.averageReadTime}m
                      </div>
                      <div className="text-xs text-slate-500">
                        Avg. Read Time
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Blogs Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <FileText className="w-6 h-6" />
                บล็อกของ {userProfile.name}
              </h2>
              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-500">
                  {userBlogs.length} โพสต์
                </div>
                {/* Filter/Sort options */}
                <Select defaultValue="latest">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">ล่าสุด</SelectItem>
                    <SelectItem value="popular">ยอดนิยม</SelectItem>
                    <SelectItem value="oldest">เก่าที่สุด</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {userBlogs.length > 0 ? (
              <>
                {/* Blogs Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Suspense fallback={<BlogCardSkeleton />}>
                    {userBlogs.map((blog) => (
                      <BlogCard key={blog.id} blog={blog as IBlogCard} />
                    ))}
                  </Suspense>
                </div>

                {/* Load More */}
                {userBlogs.length >= 6 && (
                  <div className="text-center mt-12">
                    <Button
                      variant="outline"
                      size="lg"
                      className="glass-card hover:bg-slate-50"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      โหลดเพิ่มเติม
                    </Button>
                  </div>
                )}
              </>
            ) : (
              // Empty State
              <Card className="glass-card border-0">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <FileText className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                    ยังไม่มีบล็อก
                  </h3>
                  <p className="text-slate-500 mb-6">
                    {userProfile.name} ยังไม่ได้เขียนบล็อกใดๆ
                  </p>
                  {isOwnProfile && (
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      เขียนบล็อกแรก
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
