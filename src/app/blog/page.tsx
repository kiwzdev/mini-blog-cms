// app/blog/page.tsx
"use client";

import { useState, Suspense, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import BlogCardSkeleton from "@/components/blog/BlogCardSkeleton";
import BlogCard from "@/components/blog/BlogCard";
import MainNavbar from "@/components/layout/Navbar";
import {
  Search,
  Calendar,
  Tag,
  SortDesc,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { IBlogCard } from "@/types/blog";
import { useLoading } from "@/stores/useLoadingStore";
import { getAllBlogs } from "@/api/blog";
import Loading from "@/components/layout/Loading";
import { BLOG_CATEGORIES } from "@/lib/config";
import toast from "react-hot-toast";

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
  const [timeRange, setTimeRange] = useState<"all" | "week" | "month" | "year">(
    "all"
  );

  const [blogs, setBlogs] = useState<IBlogCard[] | null>(null);
  const { isLoading, setLoading } = useLoading(`blog-feed`);

  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        fetchBlogs();
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Something went wrong";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, []);

  const fetchBlogs = async (page = 1) => {
    const response = await getAllBlogs({
      page,
      limit: 10,
    });
    if (response.success) {
      setBlogs(response.data.blogs);
      setPagination(response.data.pagination);
    } else if (response.error) {
      throw new Error(response.error.message);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((p) => ({ ...p!, page: newPage }));
    fetchBlogs(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter และ Search logic
  const filteredBlogs = blogs?.filter((blog) => {
    // Search filter
    const matchesSearch =
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    // Category filter
    const matchesCategory =
      selectedCategory === "all" || blog.category === selectedCategory;

    // Time range filter
    let matchesTimeRange = true;
    if (timeRange !== "all") {
      const now = new Date();
      const blogDate = new Date(blog.createdAt);
      const daysDiff = Math.floor(
        (now.getTime() - blogDate.getTime()) / (1000 * 60 * 60 * 24)
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
  const sortedBlogs = filteredBlogs
    ? [...filteredBlogs].sort((a, b) => {
        if (a._count && b._count) {
          if (sortBy === "latest") {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          } else {
            return b._count.likes - a._count.likes;
          }
        } else {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
      })
    : [];

  // Pagination Component
  const PaginationComponent = () => {
    if (!pagination || pagination.pages <= 1) return null;

    const { page, pages } = pagination;
    const visiblePages = [];

    // Logic สำหรับแสดงหน้า pagination
    let start = Math.max(1, page - 2);
    let end = Math.min(pages, page + 2);

    if (end - start < 4) {
      if (start === 1) {
        end = Math.min(pages, start + 4);
      } else if (end === pages) {
        start = Math.max(1, end - 4);
      }
    }

    for (let i = start; i <= end; i++) {
      visiblePages.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          ก่อนหน้า
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {start > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
              >
                1
              </Button>
              {start > 2 && <span className="px-2 text-slate-400">...</span>}
            </>
          )}

          {visiblePages.map((pageNum) => (
            <Button
              key={pageNum}
              variant={page === pageNum ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(pageNum)}
              className="min-w-[40px]"
            >
              {pageNum}
            </Button>
          ))}

          {end < pages && (
            <>
              {end < pages - 1 && (
                <span className="px-2 text-slate-400">...</span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pages)}
              >
                {pages}
              </Button>
            </>
          )}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page + 1)}
          disabled={page === pages}
          className="flex items-center gap-1"
        >
          ถัดไป
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  if (isLoading || !blogs) return <Loading />;
  else
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
                      {BLOG_CATEGORIES.map((category) => (
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
                          {/* <span className="ml-1 text-xs opacity-70">
                            ({category.count})
                          </span> */}
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
                            onClick={() =>
                              setTimeRange(
                                option.value as
                                  | "all"
                                  | "week"
                                  | "month"
                                  | "year"
                              )
                            }
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
              <div className="flex items-center gap-4">
                <p className="text-slate-600 dark:text-slate-400">
                  {filteredBlogs?.length === blogs.length
                    ? `ทั้งหมด ${sortedBlogs.length} โพสต์`
                    : `พบ ${sortedBlogs.length} โพสต์จากทั้งหมด ${blogs.length} โพสต์`}
                </p>

                {/* Pagination Info */}
                {pagination && (
                  <p className="text-sm text-slate-500">
                    หน้า {pagination.page} จาก {pagination.pages}
                  </p>
                )}
              </div>

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

            {/* Blogs Grid */}
            {sortedBlogs.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <Suspense fallback={<BlogCardSkeleton />}>
                    {sortedBlogs.map((blog) => (
                      <BlogCard key={blog.id} blog={blog as IBlogCard} />
                    ))}
                  </Suspense>
                </div>

                {/* Pagination */}
                <PaginationComponent />
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
