import { BLOG_CATEGORIES } from "@/lib/config";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; // หรือ import จาก 'shadcn/ui' ตามที่ใช้จริง
import { Filters } from "@/types/blog";

// สมมติ BLOG_CATEGORIES = [{ id, nameEn, color, icon }, ...]

export function CategorySelect({
  category,
  onFilterChange,
}: {
  category: string;
  onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
}) {
  const handleChange = (value: string) => {
    onFilterChange("category", value);
  };

  return (
    <Select value={category} onValueChange={handleChange}>
      <SelectTrigger
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg 
                                focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400
                                text-gray-800 bg-white transition-all"
      >
        <SelectValue placeholder="Category" />
      </SelectTrigger>
      <SelectContent className="z-50" side="bottom" sideOffset={5}>
        {BLOG_CATEGORIES.map((category) => (
          <SelectItem
            key={category.id}
            value={category.id}
            className="capitalize flex items-center gap-2"
          >
            <div
              className={`w-6 h-6 rounded-full ${category.color} flex items-center justify-center`}
            >
              <category.icon className="w-3 h-3 text-white" />
            </div>
            <span>{category.nameEn}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
