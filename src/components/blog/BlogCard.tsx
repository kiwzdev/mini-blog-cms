import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getImageUrl } from "@/lib/image";
import { formatDate } from "@/lib/utils";
import { IBlogCard } from "@/types/blog";
import { ArrowRight, Clock } from "lucide-react"; // [ปรับปรุง] เพิ่ม ArrowRight
import Image from "next/image";
import Link from "next/link";

function BlogCard({ blog }: { blog: IBlogCard }) {
  return (
    <Card className="glass-card overflow-hidden group transition-all duration-300 ease-in-out hover:!shadow-2xl hover:!shadow-blue-500/20 hover:-translate-y-2">
      {/* Cover Image */}
      <div className="relative h-52 overflow-hidden">
        <Link href={`/blog/${blog.id}`} className="block h-full">
          <Image
            priority={true}
            src={getImageUrl(blog.coverImage || "")}
            alt={blog.title}
            fill
            sizes="100%"
            className=" object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </Link>
      </div>

      <CardContent className="p-5 sm:p-6 flex flex-col">
        {/* Title */}
        <Link href={`/blog/${blog.id}`}>
          {/* [ปรับปรุง] ขยายขนาดตัวอักษร Title */}
          <h2 className="text-2xl font-bold mb-3 line-clamp-2 text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {blog.title}
          </h2>
        </Link>
        {/* Excerpt */}
        {/* [ปรับปรุง] ขยายขนาดตัวอักษร Excerpt */}
        <p className="text-base text-slate-600 dark:text-slate-400 mb-5 line-clamp-3 leading-relaxed flex-grow">
          {blog.excerpt}
        </p>
        {/* [ปรับปรุง] เปลี่ยน Layout ส่วนท้าย */}
        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            {/* Author & Date */}
            <div className="flex items-center gap-3">
              <Link href={`/profile/${blog.author.username}`}>
                <Image
                  src={getImageUrl(blog.author.profileImage || "")}
                  alt={blog.author.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </Link>
              <div>
                <Link href={`/profile/${blog.author.username}`}>
                  {/* [ปรับปรุง] ขยายขนาดตัวอักษรชื่อ Author */}
                  <p className="text-base font-semibold truncate text-slate-700 dark:text-slate-200">
                    {blog.author.name}
                  </p>
                </Link>
                <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  {" "}
                  {/* [ปรับปรุง] ขยายขนาดวันที่ */}
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(blog.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* [ปรับปรุง] นำปุ่ม "อ่านต่อ" กลับมาและดีไซน์ใหม่ */}
            <Button
              asChild
              variant="ghost"
              className="group/button rounded-full h-10 px-4 transition-all duration-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-700 dark:hover:text-blue-300"
            >
              <Link href={`/blog/${blog.id}`}>
                อ่านต่อ
                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover/button:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BlogCard;
