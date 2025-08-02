import { toggleLikeComment } from "@/api/like";
import { useState } from "react";

export function useLikeComment(
  commentId: string,
  initialLiked: boolean,
  initialCount: number
) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [isLiking, setisLiking] = useState(false);

  const toggleLike = async () => {
    if (isLiking) return;

    setisLiking(true);

    try {
      const response = await toggleLikeComment(commentId);

      if (response.success) {
        setIsLiked(response.data.liked);
        setLikeCount((prev) => (response.data.liked ? prev + 1 : prev - 1));
      }
      if (response.error) {
        throw new Error(response.error.message);
      }
    } catch (error) {
      // Handle error
      console.error("Error toggling like:", error);
    } finally {
      setisLiking(false);
    }
  };

  return {
    isLiked,
    likeCount,
    isLiking,
    toggleLike,
  };
}
