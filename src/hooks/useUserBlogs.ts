import { getUserBlogs } from "@/api/user";
import { BLOGS_PAGE_LIMIT } from "@/lib/config";
import { Filters, IBlogCard } from "@/types/blog";
import { useState, useCallback, useEffect } from "react";

export const useUserBlogs = (userId: string) => {
  const [blogs, setBlogs] = useState<IBlogCard[]>([]);
  const [filters, setFilters] = useState<Filters>({
    category: "",
    status: "",
    search: "",
    dateRange: { start: "", end: "" },
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogs = useCallback(
    async (page = 1, limit = 3, append = false, currentFilters = filters) => {
      if (!userId) return false;

      // Set appropriate loading state
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoadingBlogs(true);
        setError(null);
      }

      try {
        const response = await getUserBlogs(userId, {
          page,
          limit,
          ...currentFilters,
        });

        if (response.success) {
          const newBlogs = response.data as IBlogCard[];
          const meta = response.meta;

          // อัปเดทข้อมูล
          if (append) {
            setBlogs((prev) => {
              // ป้องกันข้อมูลซ้ำ
              const existingIds = new Set(prev.map((blog) => blog.id));
              const uniqueNewBlogs = newBlogs.filter(
                (blog) => !existingIds.has(blog.id)
              );
              return [...prev, ...uniqueNewBlogs];
            });
          } else {
            setBlogs(newBlogs);
          }

          // อัปเดท metadata
          if (meta) {
            setCurrentPage(meta.page);
            setTotalPages(meta.pages);
            setHasMore(meta.page < meta.pages);
          }

          return true;
        } else {
          throw new Error(response.error?.message || "Failed to fetch blogs");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error fetching blogs";

        if (!append) {
          setError(errorMessage);
        } else {
          console.error("Load more error:", errorMessage);
        }

        return false;
      } finally {
        if (append) {
          setIsLoadingMore(false);
        } else {
          setIsLoadingBlogs(false);
        }
      }
    },
    [userId, filters]
  );

  // Auto fetch เมื่อ filters เปลี่ยน (ยกเว้น search)
  useEffect(() => {
    if (userId) {
      // สร้าง debounce สำหรับ search
      const timeoutId = setTimeout(() => {
        fetchBlogs(1, BLOGS_PAGE_LIMIT, false, filters);
      }, filters.search ? 500 : 0); // Debounce 500ms สำหรับ search, ทันทีสำหรับ filters อื่น

      return () => clearTimeout(timeoutId);
    }
  }, [userId, filters, fetchBlogs]);

  // โหลดเพิ่ม blogs
  const loadMoreBlogs = useCallback(async () => {
    if (!hasMore || isLoadingBlogs || isLoadingMore) {
      return false;
    }

    const success = await fetchBlogs(currentPage + 1, 3, true, filters);
    return success;
  }, [hasMore, isLoadingBlogs, isLoadingMore, currentPage, fetchBlogs, filters]);

  // Filter handlers
  const handleFilterChange = <K extends keyof Filters>(
    key: K,
    value: Filters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // Reset pagination เมื่อ filter เปลี่ยน
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      category: "",
      status: "",
      search: "",
      dateRange: { start: "", end: "" },
    });
    setCurrentPage(1);
  };

  // Manual search (สำหรับกรณีที่ต้องการ search ทันที)
  const handleSearch = () => {
    fetchBlogs(1, BLOGS_PAGE_LIMIT, false, filters);
  };

  // รีเซ็ตข้อมูล
  const resetBlogs = useCallback(() => {
    setBlogs([]);
    setCurrentPage(1);
    setTotalPages(0);
    setHasMore(false);
    setError(null);
  }, []);

  // รีเฟรชข้อมูล
  const refreshBlogs = useCallback(async () => {
    resetBlogs();
    return await fetchBlogs(1, BLOGS_PAGE_LIMIT, false, filters);
  }, [resetBlogs, fetchBlogs, filters]);

  return {
    // Data
    blogs,
    currentPage,
    totalPages,
    hasMore,

    // Filters
    filters,
    handleFilterChange,
    resetFilters,
    handleSearch,

    // Loading states
    isLoadingBlogs,
    isLoadingMore,
    error,

    // Actions
    fetchBlogs,
    loadMoreBlogs,
    resetBlogs,
    refreshBlogs,

    // Helper states
    isEmpty: blogs.length === 0 && !isLoadingBlogs,
    isFirstLoad: isLoadingBlogs && currentPage === 1,
  };
};