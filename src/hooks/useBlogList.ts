// hooks/useBlogList.ts
import { useState, useEffect, useCallback } from "react";
import { IBlogCard, Filters } from "@/types/blog";
import { Meta } from "@/types/api";
import { getAllBlogs } from "@/api/blog";
import { BLOGS_PAGE_LIMIT } from "@/lib/config";
import toast from "react-hot-toast";

export const useBlogList = () => {
  const [blogs, setBlogs] = useState<IBlogCard[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<Meta | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);

  // Filters state
  const [filters, setFilters] = useState<Filters>({
    category: "",
    status: "",
    search: "",
    dateRange: { start: "", end: "" },
  });

  // Fetch blogs function
  const fetchBlogs = useCallback(
    async (page = 1, currentFilters = filters, filterChange = false) => {
      if (filterChange) {
        setIsFiltering(true);
      } else {
        setIsLoading(true);
      }
      try {
        const response = await getAllBlogs({
          page,
          limit: BLOGS_PAGE_LIMIT,
          ...currentFilters,
        });

        if (response.success) {
          setBlogs(response.data.blogs);
          setPagination(response.meta as Meta);
        } else if (response.error) {
          throw new Error(response.error.message);
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Something went wrong";
        toast.error(errorMessage);
        setBlogs([]);
      } finally {
        setIsLoading(false);
        setIsFiltering(false);
      }
    },
    []
  );

  // Auto fetch when non-search filters change
  useEffect(() => {
    // fetch เฉพาะเมื่อ filter อื่น ๆ เปลี่ยน (ไม่รวม search)
    fetchBlogs(1, filters, true);
  }, [filters.category, filters.status, filters.dateRange, fetchBlogs]);

  // Handle filter changes
  const handleFilterChange = useCallback(
    <K extends keyof Filters>(key: K, value: Filters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Handle search - เรียกแยกต่างหาก
  const handleSearch = useCallback(() => {
    fetchBlogs(1, filters);
  }, [fetchBlogs, filters]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      category: "",
      status: "",
      search: "",
      dateRange: { start: "", end: "" },
    });
  }, []);

  // Handle pagination
  const handlePageChange = useCallback(
    (newPage: number) => {
      setPagination((p) => ({ ...p!, page: newPage }));
      fetchBlogs(newPage, filters);
      window.scrollTo({ top: 100, behavior: "smooth" });
    },
    [fetchBlogs, filters]
  );

  return {
    blogs,
    isLoading,
    pagination,
    filters,
    isFiltering,
    handleFilterChange,
    handleSearch,
    resetFilters,
    handlePageChange,
  };
};
