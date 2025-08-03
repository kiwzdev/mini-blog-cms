import { ApiResponse } from "@/types/api";
import axios from "axios";
import { handleApiError } from "@/lib/api-response";

// Like Blog
export const toggleLikeBlog = async (blogId: string): Promise<ApiResponse> => {
  try {
    const { data } = await axios.post(`/api/blogs/${blogId}/like`);
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
export const getBlogLikes = async (
  blogId: string,
  params?: {
    limit?: number;
    page?: number;
  }
): Promise<ApiResponse> => {
  try {
    const { data } = await axios.get(`/api/blogs/${blogId}/likes`, { params });
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
