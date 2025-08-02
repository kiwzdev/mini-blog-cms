import { ApiResponse } from "@/types/api";
import axios from "axios";
import { handleApiError } from "@/lib/api-response";

// Like Post
export const toggleLikePost = async (postId: string): Promise<ApiResponse> => {
  try {
    const { data } = await axios.post(`/api/posts/${postId}/like`);
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Like Comment 
export const toggleLikeComment = async (
  commentId: string
): Promise<ApiResponse> => {
  try {
    const { data } = await axios.post(`/api/comments/${commentId}/like`);
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
