import { IUserProfile } from "@/types/user";
import { Lock } from "lucide-react";

// components/profile/ProfileStats.tsx
type ProfileStatsProps = {
  profile: IUserProfile;
  isPrivateProfile: boolean;
  followerCount: number;
  onStatClick: (type: "followers" | "following" | "blogs" | "likes") => void;
  isOwner: boolean;
};

export function ProfileStats({
  profile,
  isPrivateProfile,
  followerCount,
  onStatClick,
  isOwner,
}: ProfileStatsProps) {
  return (
    <div className="flex lg:flex-col gap-6 lg:gap-4 justify-center lg:justify-start lg:min-w-[120px]">
      {/* Always show posts count */}
      <div
        className="text-center group cursor-pointer"
        onClick={() => onStatClick("blogs")}
      >
        <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
          {profile._count.blogs.toLocaleString()}
        </div>
        <div className="text-xs md:text-sm text-slate-500">โพสต์</div>
      </div>

      {/* Show followers/following only for public profiles or own profile */}
      {!isPrivateProfile ||
      isOwner ? (
        <>
          <div
            className="text-center group cursor-pointer"
            onClick={() => onStatClick("followers")}
          >
            <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
              {followerCount || profile._count.followers.toLocaleString()}
            </div>
            <div className="text-xs md:text-sm text-slate-500">Followers</div>
          </div>

          <div
            className="text-center group cursor-pointer"
            onClick={() => onStatClick("following")}
          >
            <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
              {profile._count.following.toLocaleString()}
            </div>
            <div className="text-xs md:text-sm text-slate-500">Following</div>
          </div>

          <div
            className="text-center group cursor-pointer"
            onClick={() => onStatClick("likes")}
          >
            <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
              {profile._count.totalBlogLikes.toLocaleString()}
            </div>
            <div className="text-xs md:text-sm text-slate-500">Likes</div>
          </div>
        </>
      ) : (
        /* Show placeholder for private profiles */
        <>
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-slate-400 dark:text-slate-600">
              <Lock className="w-5 h-5 mx-auto" />
            </div>
            <div className="text-xs md:text-sm text-slate-400">Followers</div>
          </div>

          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-slate-400 dark:text-slate-600">
              <Lock className="w-5 h-5 mx-auto" />
            </div>
            <div className="text-xs md:text-sm text-slate-400">Following</div>
          </div>

          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-slate-400 dark:text-slate-600">
              <Lock className="w-5 h-5 mx-auto" />
            </div>
            <div className="text-xs md:text-sm text-slate-400">Likes</div>
          </div>
        </>
      )}
    </div>
  );
}
