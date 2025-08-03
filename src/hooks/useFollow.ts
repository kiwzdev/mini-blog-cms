import { toggleFollowUser } from "@/api/follow"; // หรือ path ที่เก็บ toggleFollowUser
import { useState } from "react";

export function useFollowUser(
  userId: string,
  initialFollowing: boolean,
  initialFollowerCount: number
) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [isToggling, setIsToggling] = useState(false);

  const toggleFollow = async () => {
    if (isToggling) return;

    setIsToggling(true);

    try {
      const response = await toggleFollowUser(userId);

      if (response.success) {
        setIsFollowing(response.data.following);
        setFollowerCount((prev) =>
          response.data.following ? prev + 1 : prev - 1
        );
      }
      if (response.error) {
        throw new Error(response.error.message);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setIsToggling(false);
    }
  };

  return {
    isFollowing,
    followerCount,
    isToggling,
    toggleFollow,
  };
}
