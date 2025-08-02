import { Heart } from "lucide-react";

type LikeButtonProps = {
  isLiked: boolean;
  likeCount: number;
  isLiking: boolean;
  toggleLike: () => void;
  size?: "sm" | "md" | "lg";
};

export function LikeButton({
  isLiked,
  likeCount,
  isLiking,
  toggleLike,
  size = "md",
}: LikeButtonProps) {
  const sizeClass =
    size === "sm" ? "w-4 h-4" : size === "lg" ? "w-8 h-8" : "w-6 h-6"; // default md

  const baseClass = `${sizeClass} cursor-pointer transition-colors duration-200`;

  return (
    <>
      <button onClick={toggleLike} disabled={isLiking}>
        {isLiked ? (
          <Heart className={`${baseClass} text-red-500 hover:text-gray-500`} />
        ) : (
          <Heart className={`${baseClass} text-gray-500 hover:text-red-500`} />
        )}
      </button>
      {likeCount || 0}
    </>
  );
}
