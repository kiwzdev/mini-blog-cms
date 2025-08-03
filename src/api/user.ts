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
export const getUserProfile = async (userId: string): Promise<ApiResponse> => {
  try {
    const { data } = await axios.get(`/api/users/${userId}/profile`);
    return data; // รวม user info + stats + recent blogs
  } catch (error) {
    return handleApiError(error);
  }
};

// Actions
export const updateUser = async (
  userId: string,
  userData: {
    name?: string;
    bio?: string;
    image?: string;
    coverImage?: string;
  }
): Promise<ApiResponse> => {
  try {
    const { data } = await axios.put(`/api/users/${userId}`, userData);
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};
