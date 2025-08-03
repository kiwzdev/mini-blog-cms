"use client";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CommentSection } from "@/components/blog/CommentSection";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Clock, Eye, Share2, Edit3 } from "lucide-react";
import { IBlog } from "@/types/blog";
import { isOwner } from "@/lib/auth";
import { getImageUrl } from "@/lib/image";
import { useLikeBlog } from "@/hooks/useLikeBlog";
import { useSession } from "next-auth/react";
import { LikeButton } from "./LikeButton";

export function BlogContent({ blog }: { blog: IBlog }) {
  const { data: session } = useSession();
  const { isLiked, likeCount, isLiking, toggleLike } = useLikeBlog(
    blog.id,
    blog.isLiked,
    blog._count?.likes || 0
  );

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับไปหน้าบล็อก
            </Link>
          </Button>
        </div>

        {/* Blog Header */}
        <div className="mb-8">
          {/* Cover Image */}
          <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8">
            <Image
              src={
                blog.coverImage
                  ? getImageUrl(blog.coverImage)
                  : process.env.NEXT_PUBLIC_DEFAULT_COVER_IMAGE!
              }
              alt={blog.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Title and Edit Button */}
          <div className="flex items-start justify-between mb-6">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight flex-1 mr-4">
              {blog.title}
            </h1>

            {/* Edit Button - แสดงเฉพาะเจ้าของโพส */}
            {isOwner(blog.author.id, session?.user?.id) && (
              <div className="flex-shrink-0">
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Link href={`/blog/${blog.id}/edit`}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    แก้ไขโพส
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-slate-600 dark:text-slate-400 mb-8">
            <div className="flex items-center gap-2">
              <Image
                src={
                  blog.author.profileImage ||
                  process.env.NEXT_PUBLIC_DEFAULT_POST_IMAGE!
                }
                alt={blog.author.name || process.env.NEXT_PUBLIC_DEFAULT_NAME!}
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="font-medium">{blog.author.name}</span>
            </div>

            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDate(blog.createdAt)}
            </div>

            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              1.2k views
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mb-8">
            <LikeButton
              likeCount={likeCount}
              isLiked={isLiked}
              isLiking={isLiking}
              toggleLike={toggleLike}
              size="md"
            />
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              แชร์
            </Button>
          </div>
        </div>

        {/* Blog Content */}
        <Card className="glass-card mb-12">
          <CardContent className="p-8">
            <div className="prose prose-lg max-w-none dark:prose-invert">
              {/* ในการใช้งานจริงจะใช้ Markdown parser หรือ Rich Text renderer */}
              <div
                dangerouslySetInnerHTML={{
                  __html: convertMarkdownToHTML(blog.content),
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Comment Section */}
        <CommentSection
          blogId={blog.id}
          blogAuthorId={blog.author.id}
          allowComments={true}
          showCommentCount={true}
        />
      </div>
    </div>
  );
}

// Helper function สำหรับแปลง Markdown เป็น HTML (simplified)
function convertMarkdownToHTML(markdown: string): string {
  return markdown
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mb-3 mt-8">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mb-2 mt-6">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /```([\s\S]*?)```/g,
      '<pre class="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto"><code>$1</code></pre>'
    )
    .replace(
      /`(.*?)`/g,
      '<code class="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">$1</code>'
    )
    .replace(/^- (.*$)/gim, '<li class="mb-1">$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/^\s*(.+)/gm, '<p class="mb-4">$1</p>');
}
