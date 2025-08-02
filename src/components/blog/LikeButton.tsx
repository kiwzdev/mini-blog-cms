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
  const sizeButtonClass =
    size === "sm" ? "w-4 h-4" : size === "lg" ? "w-8 h-8" : "w-6 h-6"; // default md

  const baseButtonClass = `${sizeButtonClass} cursor-pointer transition-colors duration-200`;

  const sizeTextClass =
    size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base"; // default md

  const baseTextClass = `${sizeTextClass} cursor-pointer transition-colors duration-200`;

  return (
    <>
      <button onClick={toggleLike} disabled={isLiking}>
        {isLiked ? (
          <Heart
            className={`${baseButtonClass} text-red-500 hover:text-gray-500`}
          />
        ) : (
          <Heart
            className={`${baseButtonClass} text-gray-500 hover:text-red-500`}
          />
        )}
      </button>
      <span className={`${baseTextClass}`}>{likeCount || 0}</span>
    </>
  );
}
