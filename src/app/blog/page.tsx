// app/blog/page.tsx
"use client";

import { useState, Suspense, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BlogCardSkeleton from "@/components/blog/BlogCardSkeleton";
import BlogCard from "@/components/blog/BlogCard";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Filters, IBlogCard } from "@/types/blog";
import { useLoading } from "@/stores/useLoadingStore";
import { getAllBlogs } from "@/api/blog";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";
import { SmartNavigation } from "@/components/Navbar/SmartNavbar";
import BlogFilters from "@/components/blog/BlogFilters";

export default function BlogPage() {
  const [blogs, setBlogs] = useState<IBlogCard[] | null>(null);
  const { isLoading, setLoading } = useLoading(`blog-feed`);

  // Filters state
  const [filters, setFilters] = useState({
    category: "",
    status: "",
    search: "",
    dateRange: { start: "", end: "" },
  });

  useEffect(() => {
    fetchBlogs(1, filters); // reset to page 1 เมื่อ filter เปลี่ยน
  }, [filters]);

  const handleSearch = () => {
  fetchBlogs(1, filters); // fetch ด้วย current filters
};

const handleFilterChange = <K extends keyof Filters>(key: K, value: Filters[K]) => {
  setFilters((prev) => ({ ...prev, [key]: value }));
};

const resetFilters = () => {
  setFilters({
    category: "",
    status: "",
    search: "",
    dateRange: { start: "", end: "" },
  });
};

  // Pagination state
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

  const fetchBlogs = async (page = 1, currentFilters = filters) => {
    const response = await getAllBlogs({
      page,
      limit: 3,
      ...currentFilters,
    });
    if (response.success) {
      setBlogs(response.data.blogs);
      setPagination(response.data.pagination);
    } else if (response.error) {
      throw new Error(response.error.message);
    }
  };

  // Handle Pagination
  const handlePageChange = (newPage: number) => {
    setPagination((p) => ({ ...p!, page: newPage }));
    fetchBlogs(newPage, filters);
    window.scrollTo({ top: 100, behavior: "smooth" });
  };

  // Pagination Component
  const PaginationComponent = () => {
    if (!pagination || pagination.pages <= 1) {
      return null;
    }

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
        <SmartNavigation />
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

            {/* Filters */}
            <BlogFilters
              onSearch={handleSearch}
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={resetFilters}
            />

            {/* Blogs Grid */}
            {blogs.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <Suspense fallback={<BlogCardSkeleton />}>
                    {blogs.map((blog) => (
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
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </>
    );
}
