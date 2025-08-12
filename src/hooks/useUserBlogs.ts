import { getUserBlogs } from "@/api/user";
import { IBlogCard } from "@/types/blog";
import { useState, useCallback} from "react";

// ปรับปรุง hook
export const useUserBlogs = (userId: string) => {
  const [blogs, setBlogs] = useState<IBlogCard[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false); // แยก loading state
  const [error, setError] = useState<string | null>(null);

  // ดึงข้อมูล blogs (ปรับปรุง)
  const fetchBlogs = useCallback(
    async (page = 1, limit = 3, append = false) => {
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
          // หมายเหตุ: signal ต้องเพิ่มใน getUserBlogs function
        });

        if (response.success) {
          const newBlogs = response.data as IBlogCard[];
          const meta = response.meta;

          // อัปเดทข้อมูล
          if (append) {
            setBlogs((prev) => {
              // ป้องกันข้อมูลซ้ำ (optional: ตรวจสอบ ID)
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
            setTotalPages(meta.totalPages);
            setHasMore(meta.page < meta.totalPages);
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
          // สำหรับ loadMore error อาจแสดง toast แทน
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
    [userId]
  );

  // โหลดเพิ่ม blogs (ปรับปรุง)
  const loadMoreBlogs = useCallback(async () => {
    // เพิ่มเงื่อนไขป้องกัน
    if (!hasMore || isLoadingBlogs || isLoadingMore) {
      return false;
    }

    const success = await fetchBlogs(currentPage + 1, 3, true);

    return success;
  }, [hasMore, isLoadingBlogs, isLoadingMore, currentPage, fetchBlogs]);

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
    return await fetchBlogs(1, 10, false);
  }, [resetBlogs, fetchBlogs]);

  return {
    // Data
    blogs,
    currentPage,
    totalPages,
    hasMore,

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
