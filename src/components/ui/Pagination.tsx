// components/ui/Pagination.tsx
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Meta } from "@/types/api";

interface PaginationProps {
  pagination: Meta | null;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({ 
  pagination, 
  onPageChange, 
  className = "" 
}: PaginationProps) {
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
    <div className={`flex items-center justify-center gap-2 mt-8 ${className}`}>
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
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
              onClick={() => onPageChange(1)}
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
            onClick={() => onPageChange(pageNum)}
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
              onClick={() => onPageChange(pages)}
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
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        className="flex items-center gap-1"
      >
        ถัดไป
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}