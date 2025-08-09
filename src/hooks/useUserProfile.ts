import { useState, useCallback, useEffect } from "react";
import { getUserProfile, updateUser } from "@/api/user";
import { IUpdateProfileData, IUserProfile } from "@/types/user";
import toast from "react-hot-toast";
import { createUpdatedUserFormData } from "@/helpers/formData";

interface UseUserProfileOptions {
  onSuccess?: (profile: IUserProfile) => void;
  onError?: (error: string) => void;
  onUpdateSuccess?: (profile: IUserProfile) => void;
  onUpdateError?: (error: string) => void;
  autoFetch?: boolean; // เรียก API ทันทีหรือไม่
}

export const useUserProfile = (
  username: string,
  options: UseUserProfileOptions = {}
) => {
  const [profile, setProfile] = useState<IUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    onSuccess,
    onError,
    onUpdateSuccess,
    onUpdateError,
    autoFetch = true,
  } = options;

  // ดึงข้อมูลโปรไฟล์
  const fetchProfile = useCallback(async () => {
    if (!username) return false;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getUserProfile(username);

      if (response.success) {
        const profileData = response.data as IUserProfile;
        setProfile(profileData);
        onSuccess?.(profileData);
        return true;
      } else {
        throw new Error(response.error?.message || "Failed to fetch profile");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error fetching profile";
      setError(errorMessage);
      onError?.(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [username, onSuccess, onError]);

  const updateProfile = useCallback(
    async (updateData: IUpdateProfileData) => {
      if (!username || !profile) return false;

      setIsUpdating(true);
      setError(null);

      try {
        toast.loading("Updating profile...", { id: "updateProfile" });

        const updatedFormData = createUpdatedUserFormData(updateData);

        // ส่ง publicId เก่าเพื่อลบรูปเก่า (ถ้ามีรูปใหม่)
        if (updateData.profileImage instanceof File && profile.profileImage) {
          updatedFormData.append("oldProfileImage", profile.profileImage);
        }

        // เรียก API ที่รับ FormData
        const response = await updateUser(username, updatedFormData);

        if (response.success) {
          const updatedProfile = response.data as IUserProfile;
          setProfile(updatedProfile);
          onUpdateSuccess?.(updatedProfile);

          toast.success("Profile updated successfully!", {
            id: "updateProfile",
          });
          return true;
        } else {
          throw new Error(
            response.error?.message || "Failed to update profile"
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error updating profile";
        setError(errorMessage);
        onUpdateError?.(errorMessage);

        toast.error(errorMessage, { id: "updateProfile" });
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [username, profile, onUpdateSuccess, onUpdateError]
  );

  // รีเฟรชโปรไฟล์
  const refreshProfile = useCallback(() => {
    return fetchProfile();
  }, [fetchProfile]);

  // รีเซ็ตข้อมูล
  const resetProfile = useCallback(() => {
    setProfile(null);
    setError(null);
  }, []);

  // Auto fetch เมื่อ username เปลี่ยน
  useEffect(() => {
    if (autoFetch && username) {
      fetchProfile();
    }
  }, [username, autoFetch]);

  // Helper functions
  const isOwnProfile = useCallback(
    (currentUserId?: string) => {
      return currentUserId === username;
    },
    [username]
  );

  const getDisplayName = useCallback(() => {
    return profile?.name || profile?.username;
  }, [profile]);

  const getProfileImageUrl = useCallback(
    (size: "sm" | "md" | "lg" = "md") => {
      if (!profile?.profileImage) return null;

      // ถ้ามี CDN หรือ image optimization
      const sizeMap = { sm: "100", md: "200", lg: "400" };
      return `${profile.profileImage}?w=${sizeMap[size]}`;
    },
    [profile]
  );

  const isProfileComplete = useCallback(() => {
    if (!profile) return false;
    return !!(profile.name && profile.bio && profile.profileImage);
  }, [profile]);

  return {
    // Data
    profile,

    // Loading states
    isLoading,
    isUpdating,
    error,

    // Actions
    fetchProfile,
    updateProfile,
    refreshProfile,
    resetProfile,

    // Helper functions
    isOwnProfile,
    getDisplayName,
    getProfileImageUrl,
    isProfileComplete,

    // Helper states
    isEmpty: !profile && !isLoading,
    hasError: !!error,
    isReady: !!profile && !isLoading,
  };
};