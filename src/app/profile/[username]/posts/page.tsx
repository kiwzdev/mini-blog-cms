// app/profile/[username]/posts/page.tsx (Optional - สำหรับดูโพสต์ทั้งหมด)
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/blog/post/PostCard";
import PostCardSkeleton from "@/components/blog/post/PostCardSkeleton";
import MainNavbar from "@/components/layout/MainNavbar";
import { ArrowLeft, FileText } from "lucide-react";
import { IPost } from "@/types";

interface UserPostsPageProps {
  params: {
    username: string;
  };
}

export default function UserPostsPage({ params }: UserPostsPageProps) {
  // ในการใช้งานจริงจะดึงข้อมูลจาก API
  const userProfile = mockUserProfile;
  const userPosts = mockUserPosts;

  return (
    <>
      <MainNavbar />
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
              รวม {userPosts.length} โพสต์
            </p>
          </div>

          {/* Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Suspense fallback={<PostCardSkeleton />}>
              {userPosts.map((post) => (
                <PostCard key={post.id} post={post as IPost} />
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
