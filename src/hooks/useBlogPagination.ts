import { getAllBlogs } from "@/api/blog";
import { IBlogCard } from "@/types/blog";
import { useState, useCallback, useEffect } from "react";

export interface PaginationOptions {
  limit?: number;
  initialPage?: number;
  userId?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const useBlogPagination = (options: PaginationOptions = {}) => {
  const { limit = 10, initialPage = 1, userId } = options;

  // States
  const [blogs, setBlogs] = useState<IBlogCard[]>([]);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch blogs for specific page
  const fetchBlogs = useCallback(
    async (page: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getAllBlogs({
          userId,
          limit,
          page,
        });

        if (response.success) {
          const blogData = response.data as IBlogCard[];
          const meta = response.meta as PaginationMeta;

          setBlogs(blogData);
          setCurrentPage(meta.page);
          setTotalPages(meta.totalPages);
          setTotalBlogs(meta.total);

          return true;
        } else {
          throw new Error(response.error?.message || "Failed to fetch blogs");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error fetching blogs";
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, limit]
  );

  // Navigation functions
  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        fetchBlogs(page);
      }
    },
    [fetchBlogs, totalPages, currentPage]
  );

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  const goToFirstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const goToLastPage = useCallback(() => {
    goToPage(totalPages);
  }, [goToPage, totalPages]);

  // Refresh current page
  const refresh = useCallback(() => {
    fetchBlogs(currentPage);
  }, [fetchBlogs, currentPage]);

  // Reset to first page
  const reset = useCallback(() => {
    setBlogs([]);
    setCurrentPage(1);
    setTotalPages(0);
    setTotalBlogs(0);
    setError(null);
    fetchBlogs(1);
  }, [fetchBlogs]);

  // Generate page numbers for pagination UI
  const getPageNumbers = useCallback(
    (visiblePages: number = 5): number[] => {
      const pages: number[] = [];
      
      if (totalPages <= visiblePages) {
        // Show all pages if total is less than or equal to visible pages
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Calculate start and end pages
        let start = Math.max(1, currentPage - Math.floor(visiblePages / 2));
        const end = Math.min(totalPages, start + visiblePages - 1);
        
        // Adjust start if end is at maximum
        if (end === totalPages) {
          start = Math.max(1, end - visiblePages + 1);
        }
        
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
      }
      
      return pages;
    },
    [currentPage, totalPages]
  );

  // Auto fetch on mount
  useEffect(() => {
    fetchBlogs(currentPage);
  }, []);

  // Helper computed values
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;
  const isEmpty = blogs.length === 0 && !isLoading;
  const startItem = totalBlogs > 0 ? (currentPage - 1) * limit + 1 : 0;
  const endItem = Math.min(currentPage * limit, totalBlogs);

  return {
    // Data
    blogs,
    currentPage,
    totalPages,
    totalBlogs,
    limit,

    // Loading & Error states
    isLoading,
    error,

    // Navigation actions
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    refresh,
    reset,

    // Helper functions
    getPageNumbers,

    // Helper computed values
    hasNextPage,
    hasPreviousPage,
    isEmpty,
    startItem,
    endItem,

    // Pagination info text
    paginationInfo: `Showing ${startItem} to ${endItem} of ${totalBlogs} results`,
  };
};