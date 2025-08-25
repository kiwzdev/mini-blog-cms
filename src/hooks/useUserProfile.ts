import { useState, useCallback, useEffect } from "react";
import { getUserProfile, updateUser } from "@/api/user";
import { IUpdateProfileData, IUserProfile, IUserSettings } from "@/types/user";
import toast from "react-hot-toast";
import { createUpdatedUserFormData } from "@/helpers/formData";
import { profileUpdateSchema } from "@/lib/validations/profileUpdateSchema";
import { useSession } from "next-auth/react";

interface UseUserProfileOptions {
  autoFetch?: boolean; // เรียก API ทันทีหรือไม่
}

export const useUserProfile = (
  username: string,
  options: UseUserProfileOptions = {}
) => {
  const { data: session, update } = useSession();

  const [profile, setProfile] = useState<IUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { autoFetch = true } = options;

  // ดึงข้อมูลโปรไฟล์
  const fetchProfile = useCallback(async (showLoading = true) => {
    if (!username) return false;

    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await getUserProfile(username);

      if (response.success) {
        const profileData = response.data as IUserProfile;
        setProfile(profileData);
        return true;
      } else {
        throw new Error(response.error?.message || "Failed to fetch profile");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error fetching profile";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [username]);

  const updateProfile = useCallback(
    async (updateData: IUpdateProfileData) => {
      if (!username || !profile) return false;

      setIsUpdating(true);
      setError(null);

      try {
        toast.loading("Updating profile...", { id: "updateProfile" });

        const validation = profileUpdateSchema.safeParse(updateData);

        if (!validation.success) {
          const messages = validation.error.issues
            .map((i) => i.message)
            .join(",\n");
          throw new Error(messages);
        }

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

          // Update session data
          await update({
            user: {
              ...session?.user,
              profileImage: updatedProfile.profileImage,
            },
          });

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

        toast.error(errorMessage, { id: "updateProfile" });
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [username, profile]
  );

  const updateSettingProfile = useCallback(
    async (updateData: IUserSettings) => {
      if (!username || !profile) return false;

      setIsUpdating(true);
      setError(null);

      try {
        toast.loading("Updating profile...", { id: "updateProfile" });

        const updatedFormData = new FormData();
        updatedFormData.append("settings", JSON.stringify(updateData));

        // เรียก API ที่รับ FormData
        const response = await updateUser(username, updatedFormData);

        if (response.success) {
          const updatedProfile = response.data as IUserProfile;
          setProfile(updatedProfile);

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

        toast.error(errorMessage, { id: "updateProfile" });
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [username, profile]
  );

  // รีเฟรชโปรไฟล์ (ไม่แสดง loading state)
  const refreshProfile = useCallback(() => {
    fetchProfile(false);
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
    updateSettingProfile,
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