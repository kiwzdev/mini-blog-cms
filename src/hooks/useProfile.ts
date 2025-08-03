import { getUserBlogs } from '@/api/user';
import { IBlogCard } from '@/types/blog';
import { useState, useCallback, useRef, useMemo, useEffect } from 'react';

// ปรับปรุง hook
export const useUserBlogs = (userId: string, options = {}) => {
  const [blogs, setBlogs] = useState<IBlogCard[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false); // แยก loading state
  const [error, setError] = useState<string | null>(null);

  // ป้องกัน concurrent requests
  const loadingRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Memoize options เพื่อป้องกัน unnecessary re-renders
  const memoizedOptions: Record<string, any> = useMemo(() => options, [JSON.stringify(options)]);

  // ดึงข้อมูล blogs (ปรับปรุง)
  const fetchBlogs = useCallback(
    async (page = 1, limit = 10, append = false) => {
      if (!userId) return false;

      // ป้องกัน concurrent requests
      if (loadingRef.current) {
        console.warn('Request already in progress');
        return false;
      }

      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      loadingRef.current = true;

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
          limit
          // หมายเหตุ: signal ต้องเพิ่มใน getUserBlogs function
        });

        // ตรวจสอบว่า request ถูก abort หรือไม่
        if (abortControllerRef.current?.signal.aborted) {
          return false;
        }

        if (response.success) {
          const newBlogs = response.data as IBlogCard[];
          const meta = response.meta;

          // อัปเดทข้อมูล
          if (append) {
            setBlogs((prev) => {
              // ป้องกันข้อมูลซ้ำ (optional: ตรวจสอบ ID)
              const existingIds = new Set(prev.map(blog => blog.id));
              const uniqueNewBlogs = newBlogs.filter(blog => !existingIds.has(blog.id));
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
      } catch (error: any) {
        // ไม่แสดง error ถ้า request ถูก abort
        if (error?.name === 'AbortError') {
          return false;
        }

        const errorMessage = error instanceof Error ? error.message : "Error fetching blogs";
        
        if (!append) {
          setError(errorMessage);
        } else {
          // สำหรับ loadMore error อาจแสดง toast แทน
          console.error('Load more error:', errorMessage);
        }
        
        memoizedOptions?.onError?.(errorMessage);
        return false;
      } finally {
        loadingRef.current = false;
        abortControllerRef.current = null;
        
        if (append) {
          setIsLoadingMore(false);
        } else {
          setIsLoadingBlogs(false);
        }
      }
    },
    [userId, memoizedOptions]
  );

  // โหลดเพิ่ม blogs (ปรับปรุง)
  const loadMoreBlogs = useCallback(async () => {
    // เพิ่มเงื่อนไขป้องกัน
    if (!hasMore || isLoadingBlogs || isLoadingMore || loadingRef.current) {
      return false;
    }

    const success = await fetchBlogs(currentPage + 1, 10, true);
    
    // จัดการ error state สำหรับ loadMore
    if (!success) {
      // อาจแสดง toast error หรือ retry button
      memoizedOptions?.onLoadMoreError?.('Failed to load more blogs');
    }
    
    return success;
  }, [hasMore, isLoadingBlogs, isLoadingMore, currentPage, fetchBlogs, memoizedOptions]);

  // รีเซ็ตข้อมูล
  const resetBlogs = useCallback(() => {
    setBlogs([]);
    setCurrentPage(1);
    setTotalPages(0);
    setHasMore(false);
    setError(null);
    
    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    loadingRef.current = false;
  }, []);

  // รีเฟรชข้อมูล
  const refreshBlogs = useCallback(async () => {
    resetBlogs();
    return await fetchBlogs(1, 10, false);
  }, [resetBlogs, fetchBlogs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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