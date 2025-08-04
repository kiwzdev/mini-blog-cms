import { useState, useCallback, useRef, useEffect } from "react";
import { getUserProfile, updateUser } from "@/api/user";
import { IUpdateUserData, IUserProfile } from "@/types/user";

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

  // ป้องกัน concurrent requests
  const loadingRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

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

    // ป้องกัน concurrent requests
    if (loadingRef.current) {
      console.warn("Profile request already in progress");
      return false;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const response = await getUserProfile(username);

      // ตรวจสอบว่า request ถูก abort หรือไม่
      if (abortControllerRef.current?.signal.aborted) {
        return false;
      }

      if (response.success) {
        const profileData = response.data as IUserProfile;
        setProfile(profileData);
        onSuccess?.(profileData);
        return true;
      } else {
        throw new Error(response.error?.message || "Failed to fetch profile");
      }
    } catch (error: any) {
      if (error?.name === "AbortError") {
        return false;
      }

      const errorMessage =
        error instanceof Error ? error.message : "Error fetching profile";
      setError(errorMessage);
      onError?.(errorMessage);
      return false;
    } finally {
      loadingRef.current = false;
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, [username, onSuccess, onError]);

  // อัปเดทโปรไฟล์
  const updateProfile = useCallback(
    async (updateData: IUpdateUserData) => {
      if (!username || !profile) return false;

      setIsUpdating(true);
      setError(null);

      try {
        const response = await updateUser(username, updateData);

        if (response.success) {
          const updatedProfile = response.data as IUserProfile;
          setProfile(updatedProfile);
          onUpdateSuccess?.(updatedProfile);
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

    // Cancel ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    loadingRef.current = false;
  }, []);

  // Auto fetch เมื่อ username เปลี่ยน
  useEffect(() => {
    if (autoFetch && username) {
      fetchProfile();
    }

    return () => {
      // Cleanup on unmount หรือ username เปลี่ยน
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
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
