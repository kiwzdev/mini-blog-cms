"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  postId: string;
  initialLikes: number;
  className?: string;
}

export function LikeButton({
  postId,
  initialLikes,
  className,
}: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      // ในการใช้งานจริงจะเรียก API
      // const response = await fetch(`/api/posts/${postId}/like`, {
      //   method: 'POST',
      // })

      // Mock การทำงาน
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (isLiked) {
        setLikes((prev) => prev - 1);
        setIsLiked(false);
      } else {
        setLikes((prev) => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLike}
      disabled={isLoading}
      className={cn(
        "transition-all duration-200",
        isLiked && "bg-red-50 border-red-200 text-red-600 hover:bg-red-100",
        className
      )}
    >
      <Heart
        className={cn(
          "w-4 h-4 mr-2 transition-all duration-200",
          isLiked && "fill-red-500 text-red-500"
        )}
      />
      {likes} {likes === 1 ? "Like" : "Likes"}
    </Button>
  );
}
