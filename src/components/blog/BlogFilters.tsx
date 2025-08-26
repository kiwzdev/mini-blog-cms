import { useState } from "react";
import { Search, Filter, ChevronDown } from "lucide-react";
import { Filters } from "@/types/blog";
import { BLOG_CATEGORIES, BLOG_STATUSES } from "@/lib/config";
import { CategorySelect } from "./CategorySelect";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface FiltersProps {
  filters: {
    category: string;
    status: string;
    search: string;
    dateRange: { start: string; end: string };
  };
  onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  onResetFilters: () => void;
  onSearch: () => void;
  isOwner?: boolean;
}

export default function BlogFilters({
  filters,
  onFilterChange,
  onResetFilters,
  onSearch,
  isOwner = false,
}: FiltersProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.status && isOwner) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    return count;
  };

  const activeCount = getActiveFiltersCount();
  const hasAnyFilter = filters.search || activeCount > 0;

  return (
    <div className="w-full max-w-5xl mx-auto mb-8 space-y-6">
      {/* Main Search Bar */}
      <form
        className="w-full"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="ค้นหาบทความ..."
              value={filters.search}
              onChange={(e) => onFilterChange("search", e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl 
                       border border-gray-200 dark:border-gray-700
                       bg-white/80 dark:bg-slate-900/70 backdrop-blur 
                       focus:outline-none focus:ring-2 focus:ring-blue-400
                       text-gray-800 dark:text-gray-200 placeholder-gray-400
                       shadow-sm transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl font-medium
                       bg-gradient-to-r from-blue-500 to-blue-600 text-white
                       hover:from-blue-600 hover:to-blue-700
                       focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                       dark:focus:ring-offset-slate-900
                       shadow hover:shadow-md active:scale-95 transition-all"
          >
            ค้นหา
          </button>

          {/* Mobile Filter Toggle */}
          <button
            type="button"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className={`md:hidden flex items-center gap-2 px-4 py-3 rounded-xl border font-medium transition-all shadow-sm
                       ${
                         activeCount > 0
                           ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                           : "bg-white/80 dark:bg-slate-900/70 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                       }`}
          >
            <Filter className="w-4 h-4" />
            {activeCount > 0 && (
              <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {activeCount}
              </span>
            )}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showMobileFilters ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </form>

      {/* Desktop Filters */}
      <div className="hidden md:block">
        <div
          className={`grid gap-6 ${
            isOwner ? "grid-cols-1 md:grid-cols-4" : "grid-cols-1 md:grid-cols-3"
          } bg-white/80 dark:bg-slate-900/70 backdrop-blur 
                     border border-gray-200 dark:border-gray-700
                     rounded-xl shadow-sm p-6`}
        >
          {/* Category */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              หมวดหมู่
            </label>
            <CategorySelect
              category={filters.category}
              onFilterChange={onFilterChange}
            />
          </div>

          {/* Status */}
          {isOwner && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                สถานะ
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) => {
                  onFilterChange("status", value);
                }}
              >
                <SelectTrigger
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg 
                             bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 
                             focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  {BLOG_STATUSES.map((status) => (
                    <SelectItem
                      key={status.id}
                      value={status.value}
                      className="capitalize"
                    >
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date Range */}
          <div className={`space-y-2 ${isOwner ? "col-span-2" : "col-span-2"}`}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              ช่วงวันที่
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Start Date */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="w-full px-3 py-2.5 h-10 flex items-center rounded-lg
                               border border-gray-300 dark:border-gray-700
                               bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200
                               focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  >
                    {filters.dateRange.start
                      ? format(new Date(filters.dateRange.start), "yyyy-MM-dd")
                      : "วันที่เริ่มต้น"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      filters.dateRange.start
                        ? new Date(filters.dateRange.start)
                        : undefined
                    }
                    onSelect={(date) => {
                      if (!date) return;
                      onFilterChange("dateRange", {
                        ...filters.dateRange,
                        start: date.toISOString(),
                      });
                    }}
                    disabled={(date) =>
                      filters.dateRange.end
                        ? date > new Date(filters.dateRange.end)
                        : false
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* End Date */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="w-full px-3 py-2.5 h-10 flex items-center rounded-lg
                               border border-gray-300 dark:border-gray-700
                               bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200
                               focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  >
                    {filters.dateRange.end
                      ? format(new Date(filters.dateRange.end), "yyyy-MM-dd")
                      : "วันที่สิ้นสุด"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      filters.dateRange.end
                        ? new Date(filters.dateRange.end)
                        : undefined
                    }
                    onSelect={(date) => {
                      if (!date) return;
                      onFilterChange("dateRange", {
                        ...filters.dateRange,
                        end: date.toISOString(),
                      });
                    }}
                    disabled={(date) =>
                      filters.dateRange.start
                        ? date < new Date(filters.dateRange.start)
                        : false
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Clear All Button */}
        {hasAnyFilter && (
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={onResetFilters}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition font-medium"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}
      </div>

      {/* Mobile Filters */}
      {showMobileFilters && (
        <div className="md:hidden space-y-4 bg-white/80 dark:bg-slate-900/70 backdrop-blur 
                        rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
          {/* Category */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              หมวดหมู่
            </label>
            <Select
              value={filters.category}
              onValueChange={(value) => {
                onFilterChange("category", value);
              }}
            >
              <SelectTrigger
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg 
                           bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200
                           focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <SelectValue placeholder="เลือกหมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                {BLOG_CATEGORIES.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={category.id}
                    className="capitalize"
                  >
                    {category.nameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          {isOwner && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                สถานะ
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) => {
                  onFilterChange("status", value);
                }}
              >
                <SelectTrigger
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg 
                             bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200
                             focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  {BLOG_STATUSES.map((status) => (
                    <SelectItem
                      key={status.id}
                      value={status.value}
                      className="capitalize"
                    >
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date Range */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              ช่วงวันที่
            </label>
            <div className="space-y-3">
              {/* Start */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg
                               bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200
                               focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm text-left"
                  >
                    {filters.dateRange.start
                      ? format(new Date(filters.dateRange.start), "yyyy-MM-dd")
                      : "วันที่เริ่มต้น"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      filters.dateRange.start
                        ? new Date(filters.dateRange.start)
                        : undefined
                    }
                    onSelect={(date) => {
                      if (!date) return;
                      onFilterChange("dateRange", {
                        ...filters.dateRange,
                        start: date.toISOString(),
                      });
                    }}
                  />
                </PopoverContent>
              </Popover>

              {/* End */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg
                               bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200
                               focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm text-left"
                  >
                    {filters.dateRange.end
                      ? format(new Date(filters.dateRange.end), "yyyy-MM-dd")
                      : "วันที่สิ้นสุด"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      filters.dateRange.end
                        ? new Date(filters.dateRange.end)
                        : undefined
                    }
                    onSelect={(date) => {
                      if (!date) return;
                      onFilterChange("dateRange", {
                        ...filters.dateRange,
                        end: date.toISOString(),
                      });
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Clear Filters */}
          {hasAnyFilter && (
            <button
              type="button"
              onClick={onResetFilters}
              className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition font-medium py-2"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          )}
        </div>
      )}
    </div>
  );
}
