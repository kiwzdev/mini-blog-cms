"use client";
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LikeButton } from "@/components/blog/like-button";
import { CommentSection } from "@/components/blog/comment-section";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Clock, User, Eye, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getPostById } from "@/api/post";
import { IPost } from "@/types";
import Loading from "@/components/layout/Loading";
import { useLoading } from "@/stores/useLoadingStore";

export default function BlogPostPage() {
  const params = useParams<{ blogId: string }>();
  const blogId = params.blogId;

  const [post, setPost] = useState<IPost | null>(null);
  const { isLoading, setLoading } = useLoading(`blog-post-${blogId}`);

  useEffect(() => {
    try {
      fetchPost();
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchPost = async () => {
    setLoading(true);
    const fetchedPost = await getPostById(blogId);

    if (fetchedPost) {
      setPost(fetchedPost);
    }
    setLoading(false);
  };

  if (isLoading) return <Loading />;
  if (!post) {
    notFound();
  } else
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

          {/* Post Header */}
          <div className="mb-8">
            {/* Cover Image */}
            <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8">
              <Image
                src={
                  post.coverImage || process.env.NEXT_PUBLIC_DEFAULT_POST_IMAGE!
                }
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-slate-600 dark:text-slate-400 mb-8">
              <div className="flex items-center gap-2">
                <Image
                  src={
                    post.author.profileImage ||
                    process.env.NEXT_PUBLIC_DEFAULT_POST_IMAGE!
                  }
                  alt={
                    post.author.name || process.env.NEXT_PUBLIC_DEFAULT_NAME!
                  }
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span className="font-medium">{post.author.name}</span>
              </div>

              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDate(post.createdAt)}
              </div>

              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                1.2k views
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 mb-8">
              <LikeButton
                postId={post.id}
                initialLikes={post._count ? post._count.likes : 0}
              />
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                แชร์
              </Button>
            </div>
          </div>

          {/* Post Content */}
          <Card className="glass-card mb-12">
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none dark:prose-invert">
                {/* ในการใช้งานจริงจะใช้ Markdown parser หรือ Rich Text renderer */}
                <div
                  dangerouslySetInnerHTML={{
                    __html: convertMarkdownToHTML(post.content),
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Comment Section */}
          <CommentSection postId={post.id} />
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
