// app/blog/page.tsx
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import PostCardSkeleton from "@/components/blog/post/PostCardSkeleton";
import PostCard from "@/components/blog/post/PostCard";

// Mock data - จะถูกแทนที่ด้วยการดึงจาก API
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
    author: {
      name: "John Doe",
      image:
        "https://www.pixelstalk.net/wp-content/uploads/2016/07/4k-Images-Free-Download.jpg",
    },
    _count: {
      likes: 24,
      comments: 8,
    },
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="gradient-text">Blog</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            บทความและเทคนิคการพัฒนาเว็บไซต์สำหรับ Developer
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Suspense fallback={<PostCardSkeleton />}>
            {mockPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </Suspense>
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="glass-card">
            โหลดเพิ่มเติม
          </Button>
        </div>
      </div>
    </div>
  );
}
