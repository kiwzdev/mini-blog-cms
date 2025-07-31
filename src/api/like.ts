import { ApiResponse } from "@/types/api";
import axios from "axios";
import { handleApiError } from "@/lib/api-response";

// Post Like Actions (สำหรับการกระทำ)
export const likePost = async (postId: string): Promise<ApiResponse> => {
  try {
    const { data } = await axios.post(`/api/posts/${postId}/like`);
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const unlikePost = async (postId: string): Promise<ApiResponse> => {
  try {
    const { data } = await axios.delete(`/api/posts/${postId}/like`);
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

// User Like Actions (สำหรับการกระทำ)
export const likeUser = async (userId: string): Promise<ApiResponse> => {
  try {
    const { data } = await axios.post(`/api/users/${userId}/like`);
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const unlikeUser = async (userId: string): Promise<ApiResponse> => {
  try {
    const { data } = await axios.delete(`/api/users/${userId}/like`);
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Like Details (เฉพาะเมื่อต้องการรายละเอียด เช่น "ใครบ้างที่ไลค์")
export const getPostLikes = async (
  postId: string,
  params?: {
    limit?: number;
    page?: number;
  }
): Promise<ApiResponse> => {
  try {
    const { data } = await axios.get(`/api/posts/${postId}/likes`, { params });
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getUserLikes = async (
  userId: string,
  params?: {
    limit?: number;
    page?: number;
  }
): Promise<ApiResponse> => {
  try {
    const { data } = await axios.get(`/api/users/${userId}/likes`, { params });
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};
