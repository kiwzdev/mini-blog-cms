"use client";
import { Suspense, useEffect, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BlogCard from "@/components/blog/BlogCard";
import BlogCardSkeleton from "@/components/blog/BlogCardSkeleton";

import { formatDate, formatDistanceToNow } from "@/lib/utils";
import {
  Calendar,
  MapPin,
  Github,
  Twitter,
  FileText,
  Instagram,
  Linkedin,
  Globe,
  Briefcase,
  Edit,
  UserPlus,
  Check,
  RefreshCw,
  Plus,
  Loader2,
  Settings,
  Phone,
  Lock,
  Mail,
} from "lucide-react";
import { IBlogCard } from "@/types/blog";
import { useSession } from "next-auth/react";
import { useUserBlogs } from "@/hooks/useUserBlogs";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useFollowUser } from "@/hooks/useFollow";
import { IUpdateProfileData, IUserBadge, IUserSettings } from "@/types/user";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/state/ErrorState";
import { EditProfileModal } from "@/components/profile/edit/EditProfileModal";
import { SmartNavigation } from "@/components/Navbar/SmartNavbar";
import { SettingProfileModal } from "@/components/profile/setting/ProfileSettingModal";
import BlogFilters from "@/components/blog/BlogFilters";
import { getImageUrl } from "@/lib/image";
import { BLOGS_PAGE_LIMIT } from "@/lib/config";

type ProfilePageProps = {
  username: string;
};

export default function ProfilePage() {
  const params = useParams<ProfilePageProps>();

  const router = useRouter();

  const { data: session } = useSession();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);

  const {
    // Data
    blogs,
    hasMore,
    // Filters
    filters,
    handleFilterChange,
    resetFilters,
    handleSearch,
    // Loading states
    isLoadingBlogs,
    isLoadingMore,
    error: blogsError,
    // Actions
    fetchBlogs,
    loadMoreBlogs,
    resetBlogs,
    refreshBlogs,
  } = useUserBlogs(session?.user?.id || "");

  const {
    // Data
    profile,
    // Loading states
    isLoading,
    isUpdating,
    error: profileError,
    // Actions
    updateProfile,
    updateSettingProfile,
    refreshProfile,
    // Helper functions
    isOwnProfile,
  } = useUserProfile(params.username || "", {
    autoFetch: true,
  });

  useEffect(() => {
    if (isEditModalOpen || isSettingModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isEditModalOpen, isSettingModalOpen]);

  // Effects
  useEffect(() => {
    if (params.username) {
      // ไม่ต้อง call fetchProfile เพราะ useUserProfile จะ autoFetch
      fetchBlogs();
    }
  }, [params.username]);

  // Handlers
  const handleFollowToggle = async () => {
    if (!profile || !session?.user) return;
    await toggleFollow();
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      loadMoreBlogs();
    }
  };

  const handleEditProfile = async (formData: IUpdateProfileData) => {
    try {
      // แยก socialLinks และ main fields
      const { socialLinks, ...mainFields } = formData;

      // กรอง socialLinks ที่มีค่า
      const cleanedSocialLinks = Object.fromEntries(
        Object.entries(socialLinks || {}).filter(
          ([_, value]) => value && String(value).trim()
        )
      );

      const updateData: IUpdateProfileData = {
        ...mainFields,
        // แปลง empty string เป็น null สำหรับ main fields
        bio: mainFields.bio?.trim() || undefined,
        location: mainFields.location?.trim() || undefined,
        jobTitle: mainFields.jobTitle?.trim() || undefined,
        company: mainFields.company?.trim() || undefined,
        education: mainFields.education?.trim() || undefined,
        socialLinks:
          Object.keys(cleanedSocialLinks).length > 0
            ? cleanedSocialLinks
            : undefined,
      };

      const success = await updateProfile(updateData);
      if (success) {
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleUpdateSettings = async (formData: IUserSettings) => {
    try {
      const success = await updateSettingProfile(formData);
      if (success) {
        setIsSettingModalOpen(false);
      }
    } catch (error) {
      console.error("Error setting profile:", error);
    }
  };

  const handleStatClick = (
    type: "followers" | "following" | "blogs" | "likes"
  ) => {
    router.push(`/profile/${params.username}/${type}`);
  };

  const handleCreateBlog = () => {
    router.push("/blog/new");
  };

  // Custom Hooks
  const { isFollowing, followerCount, isToggling, toggleFollow } =
    useFollowUser(profile?.id || "", false, 0);

  useEffect(() => {
    if (profile && isFollowing !== undefined) {
      // อัพเดต follower count เมื่อมีการ follow/unfollow
      refreshProfile();
    }
  }, [isFollowing]);

  // Loading State
  if (isLoading) {
    return (
      <>
        <SmartNavigation />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <ProfileSkeleton />
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: BLOGS_PAGE_LIMIT }).map((_, index) => (
                  <BlogCardSkeleton key={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error State
  if (profileError || blogsError) {
    return (
      <ErrorState
        error={profileError || blogsError}
        onRetry={() => {
          if (profileError) refreshProfile();
          if (blogsError) refreshBlogs();
        }}
      />
    );
  }

  // Not Found
  if (!profile && !blogs && !blogsError && !profileError) {
    return notFound();
  }
  if (profile)
    return (
      <>
        <SmartNavigation />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Profile Header */}
            <Card className="glass-card mb-8 border-0 shadow-xl">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                  {/* Left: Avatar & Quick Actions */}
                  <div className="flex flex-col justify-evenly lg:items-start gap-4">
                    <div className="relative mx-auto">
                      <div className="relative w-32 h-32 md:w-40 md:h-40">
                        <Image
                          priority={false}
                          src={getImageUrl(profile.profileImage || "")}
                          alt={profile.name}
                          fill
                          sizes="100%"
                          className="rounded-full  shadow-lg object-cover"
                        />
                        {/* Online Status - Hidden if profile is private and not own profile */}
                        {profile.lastActiveAt &&
                          (profile.settings?.profileVisibility === "public" ||
                            isOwnProfile(session?.user?.username)) && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-3 border-white rounded-full"></div>
                          )}
                        {/* Verification Badge */}
                        {profile.isVerified && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {!isOwnProfile(session?.user?.username) && (
                      <div className="mx-auto">
                        <Button
                          size="sm"
                          onClick={handleFollowToggle}
                          disabled={isToggling}
                          className={`min-w-[100px] transition-all duration-200 ${
                            isFollowing || profile.isFollowing
                              ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                              : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105"
                          }`}
                        >
                          {isToggling ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isFollowing || profile.isFollowing ? (
                            ""
                          ) : (
                            <UserPlus className="w-4 h-4 mr-2" />
                          )}
                          {isFollowing || profile.isFollowing
                            ? "Following"
                            : "Follow"}
                        </Button>
                      </div>
                    )}

                    {isOwnProfile(session?.user?.username) && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-w-[120px]"
                          onClick={() => setIsEditModalOpen(true)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          แก้ไขโปรไฟล์
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-w-[120px]"
                          onClick={() => setIsSettingModalOpen(true)}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          ตั้งค่าโปรไฟล์
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Center: Profile Info */}
                  <div className="flex-1 space-y-4">
                    <div className="text-center lg:text-left">
                      <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                          {profile.name}
                        </h1>
                        {profile.badge && (
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              profile.badge === ("creator" as IUserBadge)
                                ? "bg-purple-100 text-purple-700"
                                : profile.badge === ("pro" as IUserBadge)
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {profile.badge.toString().toUpperCase()}
                          </span>
                        )}
                      </div>

                      <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">
                        @{profile.username}
                      </p>

                      {/* Job Title & Company - Hidden if profile is private and not own profile */}
                      {(profile.jobTitle || profile.company) &&
                        (profile.settings?.profileVisibility === "public" ||
                          isOwnProfile(session?.user?.username)) && (
                          <div className="flex items-center justify-center lg:justify-start gap-1 text-slate-600 dark:text-slate-400 mb-2">
                            <Briefcase className="w-4 h-4" />
                            <span>
                              {profile.jobTitle}
                              {profile.jobTitle && profile.company && " ที่ "}
                              {profile.company}
                            </span>
                          </div>
                        )}
                      {/* Privacy Indicator for Private Profiles */}
                      {profile.settings?.profileVisibility === "private" &&
                        !isOwnProfile(session?.user?.username) && (
                          <div className="flex items-center justify-center lg:justify-start gap-1 text-amber-600 dark:text-amber-400 mb-2">
                            <Lock className="w-4 h-4" />
                            <span className="text-sm">โปรไฟล์ส่วนตัว</span>
                          </div>
                        )}
                    </div>

                    {profile.bio && (
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-center lg:text-left">
                        {profile.bio}
                      </p>
                    )}

                    {/* Meta Info - Hidden if profile is private and not own profile */}
                    {(profile.settings?.profileVisibility === "public" ||
                      isOwnProfile(session?.user?.username)) && (
                      <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-slate-600 dark:text-slate-400">
                        {profile.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {profile.location}
                          </div>
                        )}

                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            เข้าร่วมเมื่อ{" "}
                            {formatDate(new Date(profile.createdAt))}
                          </div>
                          {profile.settings?.showPhone ||
                            (isOwnProfile(session?.user?.username) && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {profile.phone}
                              </div>
                            ))}
                          {profile.settings?.showPhone ||
                            (isOwnProfile(session?.user?.username) && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {profile.email}
                              </div>
                            ))}
                        </div>

                        {profile.lastActiveAt && (
                          <div className="flex items-center gap-1 text-green-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            ออนไลน์ล่าสุด{" "}
                            {formatDistanceToNow(
                              new Date(profile.lastActiveAt)
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Social Links - Hidden if profile is private and not own profile */}
                    {profile.socialLinks &&
                      Object.keys(profile.socialLinks).length > 0 &&
                      (profile.settings?.profileVisibility === "public" ||
                        isOwnProfile(session?.user?.username)) && (
                        <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                          {profile.socialLinks.website && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="hover:bg-slate-50"
                            >
                              <a
                                href={profile.socialLinks.website}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Globe className="w-4 h-4" />
                              </a>
                            </Button>
                          )}

                          {profile.socialLinks.github && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="hover:bg-slate-50"
                            >
                              <a
                                href={profile.socialLinks.github}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Github className="w-4 h-4" />
                              </a>
                            </Button>
                          )}

                          {profile.socialLinks.twitter && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="hover:bg-slate-50"
                            >
                              <a
                                href={profile.socialLinks.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Twitter className="w-4 h-4" />
                              </a>
                            </Button>
                          )}

                          {profile.socialLinks.linkedin && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="hover:bg-slate-50"
                            >
                              <a
                                href={profile.socialLinks.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Linkedin className="w-4 h-4" />
                              </a>
                            </Button>
                          )}

                          {profile.socialLinks.instagram && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="hover:bg-slate-50"
                            >
                              <a
                                href={profile.socialLinks.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Instagram className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      )}

                    {/* Private Profile Message */}
                    {profile.settings?.profileVisibility === "private" &&
                      !isOwnProfile(session?.user?.username) && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-center">
                          <div className="flex items-center justify-center gap-2 text-amber-700 dark:text-amber-300">
                            <Lock className="w-5 h-5" />
                            <span className="font-medium">
                              โปรไฟล์นี้เป็นส่วนตัว
                            </span>
                          </div>
                          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                            ข้อมูลรายละเอียดและกิจกรรมถูกจำกัดการเข้าถึง
                          </p>
                        </div>
                      )}
                  </div>

                  {/* Right: Stats - Show limited stats for private profiles */}
                  <div className="flex lg:flex-col gap-6 lg:gap-4 justify-center lg:justify-start lg:min-w-[120px]">
                    {/* Always show posts count */}
                    <div
                      className="text-center group cursor-pointer"
                      onClick={() => handleStatClick("blogs")}
                    >
                      <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {profile._count.blogs.toLocaleString()}
                      </div>
                      <div className="text-xs md:text-sm text-slate-500">
                        โพสต์
                      </div>
                    </div>

                    {/* Show followers/following only for public profiles or own profile */}
                    {profile.settings?.profileVisibility === "public" ||
                    isOwnProfile(session?.user?.username) ? (
                      <>
                        <div
                          className="text-center group cursor-pointer"
                          onClick={() => handleStatClick("followers")}
                        >
                          <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                            {followerCount ||
                              profile._count.followers.toLocaleString()}
                          </div>
                          <div className="text-xs md:text-sm text-slate-500">
                            Followers
                          </div>
                        </div>

                        <div
                          className="text-center group cursor-pointer"
                          onClick={() => handleStatClick("following")}
                        >
                          <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                            {profile._count.following.toLocaleString()}
                          </div>
                          <div className="text-xs md:text-sm text-slate-500">
                            Following
                          </div>
                        </div>

                        <div
                          className="text-center group cursor-pointer"
                          onClick={() => handleStatClick("likes")}
                        >
                          <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                            {profile._count.blogLikes.toLocaleString()}
                          </div>
                          <div className="text-xs md:text-sm text-slate-500">
                            Likes
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Show placeholder for private profiles */
                      <>
                        <div className="text-center">
                          <div className="text-xl md:text-2xl font-bold text-slate-400 dark:text-slate-600">
                            <Lock className="w-5 h-5 mx-auto" />
                          </div>
                          <div className="text-xs md:text-sm text-slate-400">
                            Followers
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-xl md:text-2xl font-bold text-slate-400 dark:text-slate-600">
                            <Lock className="w-5 h-5 mx-auto" />
                          </div>
                          <div className="text-xs md:text-sm text-slate-400">
                            Following
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-xl md:text-2xl font-bold text-slate-400 dark:text-slate-600">
                            <Lock className="w-5 h-5 mx-auto" />
                          </div>
                          <div className="text-xs md:text-sm text-slate-400">
                            Likes
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Blogs Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <FileText className="w-6 h-6" />
                  บล็อกของ {profile.name}
                </h2>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-slate-500">
                    {blogs.length} โพสต์
                  </div>
                </div>
              </div>

              {/* Filter/Sort options */}
              <BlogFilters
                onSearch={handleSearch}
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={resetFilters}
                isOwner={isOwnProfile(session?.user?.username)}
              />
              {isLoadingBlogs ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: BLOGS_PAGE_LIMIT }).map((_, index) => (
                    <BlogCardSkeleton key={index} />
                  ))}
                </div>
              ) : blogs.length > 0 ? (
                <>
                  {/* Blogs Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Suspense fallback={<BlogCardSkeleton />}>
                      {blogs.map((blog) => (
                        <BlogCard key={blog.id} blog={blog as IBlogCard} />
                      ))}
                    </Suspense>
                  </div>
                  {/* Load More */}
                  {hasMore && (
                    <div className="text-center mt-12">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="glass-card hover:bg-slate-50"
                      >
                        {isLoadingMore ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4 mr-2" />
                        )}
                        {isLoadingMore ? "กำลังโหลด..." : "โหลดเพิ่มเติม"}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                // Empty State
                <>
                  <Card className="glass-card border-0">
                    <CardContent className="p-12 text-center">
                      <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                        <FileText className="w-10 h-10 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                        ยังไม่มีบล็อก
                      </h3>
                      <p className="text-slate-500 mb-6">
                        {profile.name} ยังไม่ได้เขียนบล็อกใดๆ
                      </p>
                      {isOwnProfile(session?.user?.username) && (
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={handleCreateBlog}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          เขียนบล็อกแรก
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <EditProfileModal
          profile={profile}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditProfile}
          isUpdating={isUpdating}
        />
        <SettingProfileModal
          settings={profile.settings || ({} as IUserSettings)}
          isOpen={isSettingModalOpen}
          onClose={() => setIsSettingModalOpen(false)}
          onSave={handleUpdateSettings}
          isUpdating={isUpdating}
        />
      </>
    );
}
