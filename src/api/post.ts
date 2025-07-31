// API Functions for Social Media App
import { ICreatePostInput, IUpdatePostInput } from "@/types";
import { ApiResponse } from "@/types/api";
import axios from "axios";
import { handleApiError } from ".";

// For Blog page
export const getAllPosts = async (params?: {
  userId?: string;
  limit?: number;
  page?: number;
  includeDetails?: boolean; // รวม likes/comments count + isLiked
}): Promise<ApiResponse> => {
  try {
    const { data } = await axios.get("/api/posts", { params });
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

// For Post detail page - Full Info
export const getPostById = async (postId: string): Promise<ApiResponse> => {
  try {
    const { data } = await axios.get(`/api/posts/${postId}`);
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Post Actions
export const createPost = async (
  postData: ICreatePostInput
): Promise<ApiResponse> => {
  try {
    const { data } = await axios.post("/api/posts", postData);
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updatePost = async (
  postId: string,
  postData: IUpdatePostInput
): Promise<ApiResponse> => {
  try {
    const { data } = await axios.put(`/api/posts/${postId}`, postData);
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const deletePost = async (id: string): Promise<ApiResponse> => {
  try {
    const { data } = await axios.delete(`/api/posts/${id}`);
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};
