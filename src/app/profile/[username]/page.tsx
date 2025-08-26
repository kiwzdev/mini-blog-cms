"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// Components
import { SmartNavigation } from "@/components/Navbar/SmartNavbar";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileBlogsSection } from "@/components/profile/ProfileBlogsSection";
import { EditProfileModal } from "@/components/profile/edit/EditProfileModal";
import { SettingProfileModal } from "@/components/profile/setting/ProfileSettingModal";
import { ErrorState } from "@/components/state/ErrorState";

// Hooks
import { useUserBlogs } from "@/hooks/useUserBlogs";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useFollowUser } from "@/hooks/useFollow";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

// Types
import { IUpdateProfileData, IUserSettings } from "@/types/user";
import { ProfilePageSkeleton } from "@/components/profile/ProfilePageSkeleton";

type ProfilePageProps = {
  username: string;
};

export default function ProfilePage() {
  const params = useParams<ProfilePageProps>();
  const router = useRouter();
  const { data: session } = useSession();

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);

  // Lock body scroll when modals are open
  useBodyScrollLock(isEditModalOpen || isSettingModalOpen);

  // Hooks

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
    refreshBlogs,
  } = useUserBlogs(profile?.id || "");

  const { isFollowing, followerCount, isToggling, toggleFollow } =
    useFollowUser(
      profile?.id || "",
      profile?.isFollowed || false,
      profile?._count?.followers || 0
    );

  // Memoized values
  const isOwner = useMemo(
    () => isOwnProfile(session?.user?.username),
    [session?.user?.username, profile?.username]
  );

  const isPrivateProfile = useMemo(
    () => profile?.settings?.profileVisibility === "private" && !isOwner,
    [profile?.settings?.profileVisibility, isOwner]
  );

  // Effects
  useEffect(() => {
    if (params.username) {
      fetchBlogs();
    }
  }, [params.username, fetchBlogs]);

  useEffect(() => {
    if (profile && isFollowing !== undefined) {
      refreshProfile();
    }
  }, [isFollowing, refreshProfile]);

  // Event Handlers
  const handleFollowToggle = useCallback(async () => {
    if (!profile || !session?.user) return;
    await toggleFollow();
  }, [profile, session?.user, toggleFollow]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      loadMoreBlogs();
    }
  }, [hasMore, isLoadingMore, loadMoreBlogs]);

  const handleEditProfile = useCallback(
    async (formData: IUpdateProfileData) => {
      try {
        const { socialLinks, ...mainFields } = formData;

        const cleanedSocialLinks = Object.fromEntries(
          Object.entries(socialLinks || {}).filter(
            ([_, value]) => value && String(value).trim()
          )
        );

        const updateData: IUpdateProfileData = {
          ...mainFields,
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
    },
    [updateProfile]
  );

  const handleUpdateSettings = useCallback(
    async (formData: IUserSettings) => {
      try {
        const success = await updateSettingProfile(formData);
        if (success) {
          setIsSettingModalOpen(false);
        }
      } catch (error) {
        console.error("Error setting profile:", error);
      }
    },
    [updateSettingProfile]
  );

  const handleStatClick = useCallback(
    (type: "followers" | "following" | "blogs" | "likes") => {
      router.push(`/profile/${params.username}/${type}`);
    },
    [router, params.username]
  );

  const handleCreateBlog = useCallback(() => {
    router.push("/blog/new");
  }, [router]);

  const handleRetry = useCallback(() => {
    if (profileError) refreshProfile();
    if (blogsError) refreshBlogs();
  }, [profileError, blogsError, refreshProfile, refreshBlogs]);

  // Loading State
  if (isLoading) {
    return <ProfilePageSkeleton />;
  }

  // Error State
  if (profileError || blogsError) {
    return (
      <ErrorState error={profileError || blogsError} onRetry={handleRetry} />
    );
  }

  // Not Found
  if (!profile && !blogs && !blogsError && !profileError) {
    return notFound();
  }

  if (!profile) return null;

  return (
    <>
      <SmartNavigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Profile Header */}

          <ProfileHeader
            profile={profile}
            isOwner={isOwner}
            isPrivateProfile={isPrivateProfile}
            isFollowing={isFollowing}
            isToggling={isToggling}
            onFollowToggle={handleFollowToggle}
            onEditProfile={() => setIsEditModalOpen(true)}
            onSettings={() => setIsSettingModalOpen(true)}
            onStatsClick={handleStatClick}
            followerCount={followerCount}
          />

          {/* Blogs Section */}
          <ProfileBlogsSection
            profile={profile}
            blogs={blogs}
            hasMore={hasMore}
            filters={filters}
            isOwner={isOwner}
            isLoadingBlogs={isLoadingBlogs}
            isLoadingMore={isLoadingMore}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            onResetFilters={resetFilters}
            onLoadMore={handleLoadMore}
            onCreateBlog={handleCreateBlog}
          />
        </div>
      </div>

      {/* Modals */}
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
