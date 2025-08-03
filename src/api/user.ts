import { ApiResponse } from "@/types/api";
import axios from "axios";
import { handleApiError } from "@/lib/api-response";

// For User profile page
export const getUserBlogs = async (userId: string): Promise<ApiResponse> => {
  try {
    const { data } = await axios.get(`/api/users/${userId}/blogs`, {
      params: { userId },
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

export const deleteUser = async (userId: string): Promise<ApiResponse> => {
  try {
    const { data } = await axios.delete(`/api/users/${userId}`);
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

// For Admin dashboard page
export const getUsers = async (params?: {
  search?: string;
  limit?: number;
  page?: number;
}): Promise<ApiResponse> => {
  try {
    const { data } = await axios.get("/api/users", { params });
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};
