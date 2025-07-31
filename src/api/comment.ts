import { ApiResponse } from "@/types/api";
import axios from "axios";
import { handleApiError } from ".";

// Post Comments
export const getPostComments = async (
  postId: string,
  params?: {
    limit?: number;
    page?: number;
  }
): Promise<ApiResponse> => {
  const { data } = await axios.get(`/api/posts/${postId}/comments`, { params });
  return data;
};

export const createPostComment = async (
  postId: string,
  commentData: {
    content: string;
    userId: string;
  }
): Promise<ApiResponse> => {
  try {
    const { data } = await axios.post(
      `/api/posts/${postId}/comments`,
      commentData
    );
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const editPostComment = async (
  postId: string,
  commentData: {
    content: string;
    userId: string;
  }
): Promise<ApiResponse> => {
  try {
    const { data } = await axios.put(
      `/api/posts/${postId}/comments`,
      commentData
    );
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

// User Comments
export const getUserComments = async (
  userId: string,
  params?: {
    limit?: number;
    page?: number;
  }
): Promise<ApiResponse> => {
  try {
    const { data } = await axios.get(`/api/users/${userId}/comments`, {
      params,
    });
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const createUserComment = async (
  userId: string,
  commentData: {
    content: string;
    userId: string;
  }
): Promise<ApiResponse> => {
  try {
    const { data } = await axios.post(
      `/api/users/${userId}/comments`,
      commentData
    );
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const editUserComment = async (
  userId: string,
  commentData: {
    content: string;
    userId: string;
  }
): Promise<ApiResponse> => {
  try {
    const { data } = await axios.put(
      `/api/users/${userId}/comments`,
      commentData
    );
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Comment CRUD (แยก Resource)
export const getComment = async (commentId: string): Promise<ApiResponse> => {
  try {
    const { data } = await axios.get(`/api/comments/${commentId}`);
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateComment = async (
  commentId: string,
  content: string
): Promise<ApiResponse> => {
  try {
    const { data } = await axios.put(`/api/comments/${commentId}`, { content });
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteComment = async (
  commentId: string
): Promise<ApiResponse> => {
  try {
    const { data } = await axios.delete(`/api/comments/${commentId}`);
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};
