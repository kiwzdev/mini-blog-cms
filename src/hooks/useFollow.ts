import { toggleFollowUser } from "@/api/follow"; // หรือ path ที่เก็บ toggleFollowUser
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export function useFollowUser(
  userId: string,
  initialFollowing: boolean,
  initialFollowerCount: number
) {
  const { data: session } = useSession();
  const router = useRouter();

  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [isToggling, setIsToggling] = useState(false);

  const toggleFollow = async () => {
    if (isToggling) return;

    setIsToggling(true);

    try {
      if (!session) {
        toast.error("Please sign in to follow");
        router.push("/auth/sign-in");
      }
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
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(errorMessage);
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
