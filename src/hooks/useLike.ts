import { useState } from "react";
import { toggleLikeBlog, toggleLikeComment } from "@/api/like";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"
import toast from "react-hot-toast";

type LikeType = "blog" | "comment";

interface LikeApiMap {
  blog: typeof toggleLikeBlog;
  comment: typeof toggleLikeComment;
}

const likeApiMap: LikeApiMap = {
  blog: toggleLikeBlog,
  comment: toggleLikeComment,
};

// Core hook (เหมือนเดิม)
export function useLike(
  type: LikeType,
  targetId: string,
  initialLiked: boolean,
  initialCount: number
) {
  const { data: session } = useSession();
  const router = useRouter();

  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [isLiking, setIsLiking] = useState(false);

  const toggleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);

    try {
      if (!session) {
        toast.error("Please sign in to like");
        router.push("/auth/sign-in");
      }
      const apiFunction = likeApiMap[type];
      const response = await apiFunction(targetId);

      if (response.success) {
        setIsLiked(response.data.liked);
        setLikeCount((prev) => (response.data.liked ? prev + 1 : prev - 1));
        return true;
      } else {
        throw new Error(response.error?.message || "Failed to toggle like");
      }
    } catch (error) {
      console.error(`Error toggling ${type} like:`, error);
      return false;
    } finally {
      setIsLiking(false);
    }
  };

  return {
    isLiked,
    likeCount,
    isLiking,
    toggleLike,
  };
}

// Wrapper hooks

export const useBlogLike = (
  blogId: string,
  initialLiked: boolean,
  initialCount: number
) => useLike("blog", blogId, initialLiked, initialCount);

export const useCommentLike = (
  commentId: string,
  initialLiked: boolean,
  initialCount: number
) => useLike("comment", commentId, initialLiked, initialCount);
