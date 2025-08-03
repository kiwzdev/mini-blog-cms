import { handleApiError } from "@/lib/api-response";
import { ApiResponse } from "@/types/api";
import axios from "axios";

// Blog Comments
export const getBlogComments = async (
  blogId: string,
  params?: {
    limit?: number;
    page?: number;
  }
): Promise<ApiResponse> => {
  const { data } = await axios.get(`/api/blogs/${blogId}/comments`, { params });
  return data;
};

export const createBlogComment = async (
  blogId: string,
  content: string
): Promise<ApiResponse> => {
  try {
    const { data } = await axios.post(`/api/blogs/${blogId}/comments`, {
      content,
    });
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteBlogComment = async (
  blogId: string,
  commentId: string
): Promise<ApiResponse> => {
  try {
    const { data } = await axios.delete(
      `/api/blogs/${blogId}/comments/${commentId}`
    );
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const editBlogComment = async (
  blogId: string,
  commentId: string,
  content: string
): Promise<ApiResponse> => {
  try {
    const { data } = await axios.put(
      `/api/blogs/${blogId}/comments/${commentId}`,
      { content }
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
    const { data } = await axios.post(`/api/users/${userId}/comments`, {
      ...commentData,
    });
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
    const { data } = await axios.put(`/api/users/${userId}/comments`, {
      ...commentData,
    });
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
