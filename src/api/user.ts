import { ApiResponse } from "@/types/api";
import axios from "axios";
import { handleApiError } from "@/lib/api-response";
import { IUpdateUserData } from "@/types/user";

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
  userData: IUpdateUserData
): Promise<ApiResponse> => {
  try {
    const { data } = await axios.put(
      `/api/users/profile/${username}`,
      userData
    );
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};
