// app/blog/page.tsx
"use client";

import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import BlogCardSkeleton from "@/components/blog/BlogCardSkeleton";
import BlogCard from "@/components/blog/BlogCard";
import { Search } from "lucide-react";
import { IBlogCard } from "@/types/blog";
import Loading from "@/components/Loading";
import { SmartNavigation } from "@/components/Navbar/SmartNavbar";
import BlogFilters from "@/components/blog/BlogFilters";
import Pagination from "@/components/ui/Pagination";
import { useBlogList } from "@/hooks/useBlogList";
import { BLOGS_PAGE_LIMIT } from "@/lib/config";
import Footer from "@/components/Footer/Footer";

export default function BlogPage() {
  const {
    blogs,
    isLoading,
    isFiltering,
    pagination,
    filters,
    handleFilterChange,
    handleSearch,
    resetFilters,
    handlePageChange,
  } = useBlogList();

  // แสดง Loading component เฉพาะตอน initial load
  if (isLoading) return <Loading />;

  return (
    <>
      <SmartNavigation />
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="gradient-text">Mini Blog</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              พื้นที่แบ่งปันบทความ ความรู้ และประสบการณ์ต่างๆ
            </p>
          </div>

          {/* Filters */}
          <BlogFilters
            onSearch={handleSearch}
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={resetFilters}
          />

          {/* Blogs Grid */}
          {isFiltering ? (
            // แสดง skeleton เมื่อกำลัง filter
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: BLOGS_PAGE_LIMIT }).map((_, index) => (
                <BlogCardSkeleton key={index} />
              ))}
            </div>
          ) : blogs && blogs.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Suspense fallback={<BlogCardSkeleton />}>
                  {blogs.map((blog) => (
                    <BlogCard key={blog.id} blog={blog as IBlogCard} />
                  ))}
                </Suspense>
              </div>

              {/* Pagination */}
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
                className="mb-8"
              />
            </>
          ) : (
            // No Results
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <Search className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <h3 className="text-xl font-semibold mb-2">
                  ไม่พบบทความที่ตรงกับการค้นหา
                </h3>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
