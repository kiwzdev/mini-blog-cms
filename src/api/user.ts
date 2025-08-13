import { ApiResponse } from "@/types/api";
import axios from "axios";
import { handleApiError } from "@/lib/api-response";

// For User profile page
export const getUserBlogs = async (
  userId: string,
  params: { limit?: number; page?: number }
): Promise<ApiResponse> => {
  try {
    const { data } = await axios.get(`/api/users/${userId}/blogs`, {
      params,
    });
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

// For User profile page
export const getUserProfile = async (
  username: string
): Promise<ApiResponse> => {
  try {
    const { data } = await axios.get(`/api/users/profile/${username}`);
    return data; // รวม user info + stats + recent blogs
  } catch (error) {
    return handleApiError(error);
  }
};

// Actions
export const updateUser = async (
  username: string,
  formData: FormData
): Promise<ApiResponse> => {
  try {
    const { data } = await axios.put(
      `/api/users/profile/${username}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};
