import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLike } from "@/hooks/useLike";
import { getImageUrl } from "@/lib/image";
import { formatDate } from "@/lib/utils";
import { IBlogCard } from "@/types/blog";
import { Clock, Heart, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LikeButton } from "./LikeButton";

function PostCard({ post }: { post: IBlogCard }) {
  const { isLiked, likeCount, isLiking, toggleLike } = useLike(
    post.id,
    post.isLiked,
    post._count ? post._count.likes : 0
  );

  return (
    <Card className="glass-card overflow-hidden hover:scale-105 transition-all duration-300 group">
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={
            post.coverImage
              ? getImageUrl(post.coverImage)
              : process.env.NEXT_PUBLIC_DEFAULT_POST_IMAGE!
          }
          alt={post.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      <CardContent className="p-6">
        {/* Author & Date */}
        <div className="flex items-center gap-3 mb-4">
          <Image
            src={
              post.author.profileImage
                ? getImageUrl(post.author.profileImage)
                : process.env.NEXT_PUBLIC_DEFAULT_POST_IMAGE!
            }
            alt={post.author.name ?? process.env.NEXT_PUBLIC_DEFAULT_NAME!}
            width={32}
            height={32}
            className="rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{post.author.name}</p>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              {formatDate(post.createdAt)}
            </div>
          </div>
        </div>

        {/* Title & Excerpt */}
        <Link href={`/blog/${post.id}`}>
          <h2 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h2>
        </Link>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        {/* Stats & Read More */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <LikeButton
                likeCount={likeCount}
                isLiked={isLiked}
                isLiking={isLiking}
                toggleLike={toggleLike}
                size="sm"
              />
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {(post._count && post._count.comments) || 0}
            </div>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/blog/${post.id}`}>อ่านต่อ →</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default PostCard;
