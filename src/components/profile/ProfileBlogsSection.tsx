// components/profile/BlogsSection.tsx

"use client";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BlogCard from "@/components/blog/BlogCard";
import BlogCardSkeleton from "@/components/blog/BlogCardSkeleton";

import { RefreshCw, Plus, Loader2, FileText } from "lucide-react";
import { Filters, IBlogCard } from "@/types/blog";
import { IUserProfile } from "@/types/user";
import BlogFilters from "@/components/blog/BlogFilters";
import { BLOGS_PAGE_LIMIT } from "@/lib/config";

type ProfileBlogsSectionProps = {
  profile: IUserProfile;
  blogs: IBlogCard[];
  hasMore: boolean;
  filters: Filters;
  isOwner: boolean;
  isLoadingBlogs: boolean;
  isLoadingMore: boolean;
  onSearch: () => void;
  onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  onResetFilters: () => void;
  onLoadMore: () => void;
  onCreateBlog: () => void;
};

export function ProfileBlogsSection({
  profile,
  blogs,
  hasMore,
  filters,
  isOwner,
  isLoadingBlogs,
  isLoadingMore,
  onSearch,
  onFilterChange,
  onResetFilters,
  onLoadMore,
  onCreateBlog,
}: ProfileBlogsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
          <FileText className="w-6 h-6" />
          บล็อกของ {profile.name}
        </h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-500">{blogs.length} โพสต์</div>
        </div>
      </div>

      {/* Filter/Sort options */}
      <BlogFilters
        onSearch={onSearch}
        filters={filters}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
        isOwner={isOwner}
      />
      {isLoadingBlogs ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: BLOGS_PAGE_LIMIT }).map((_, index) => (
            <BlogCardSkeleton key={index} />
          ))}
        </div>
      ) : blogs.length > 0 ? (
        <>
          {/* Blogs Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Suspense fallback={<BlogCardSkeleton />}>
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog as IBlogCard} />
              ))}
            </Suspense>
          </div>
          {/* Load More */}
          {hasMore && (
            <div className="text-center mt-12">
              <Button
                variant="outline"
                size="lg"
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="glass-card hover:bg-slate-50"
              >
                {isLoadingMore ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {isLoadingMore ? "กำลังโหลด..." : "โหลดเพิ่มเติม"}
              </Button>
            </div>
          )}
        </>
      ) : (
        // Empty State
        <>
          <Card className="glass-card border-0">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <FileText className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                ยังไม่มีบล็อก
              </h3>
              <p className="text-slate-500 mb-6">
                {profile.name} ยังไม่ได้เขียนบล็อกใดๆ
              </p>
              {isOwner && (
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={onCreateBlog}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  เขียนบล็อกแรก
                </Button>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
