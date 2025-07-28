// API Functions for Social Media App

import { Post } from "@/types";
import axios from "axios";

// For Blog page
export const getAllPosts = async (params?: {
  userId?: string;
  limit?: number;
  page?: number;
  includeDetails?: boolean; // รวม likes/comments count + isLiked
}) => {
  const { data } = await axios.get("/api/posts", { params });
  return data;
};

// For User profile page
export const getUserPosts = async (userId: string) => {
  const { data } = await axios.get("/api/posts", {
    params: { userId },
  });
  return data;
};

// For Post detail page - Full Info
export const getPostDetail = async (slug: string) => {
  const { data } = await axios.get(`/api/posts/${slug}/detail`);
  return data; // PostWithFullDetails
};

// Post Actions
export const createPost = async (postData: Post) => {
  const { data } = await axios.post("/api/posts", postData);
  return data;
};

export const updatePost = async (postData: Post) => {
  const { data } = await axios.put(`/api/posts/${postData.id}`, postData);
  return data;
};

export const deletePost = async (id: string) => {
  const { data } = await axios.delete(`/api/posts/${id}`);
  return data;
};

// Upload API Functions
export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await axios.post("/api/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const uploadImages = async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append(`files`, file);
  });

  const { data } = await axios.post("/api/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

// Utility Functions
export const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error status
    throw new Error(error.response.data?.message || "An error occurred");
  } else if (error.request) {
    // Request was made but no response received
    throw new Error("Network error - please try again");
  } else {
    // Something else happened
    throw new Error("An unexpected error occurred");
  }
};

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// React Query Keys (สำหรับใช้กับ React Query/TanStack Query)
export const queryKeys = {
  posts: ["posts"] as const,
  post: (id: string) => ["posts", id] as const,
  userPosts: (userId: string) => ["posts", "user", userId] as const,
  comments: (postId: string) => ["posts", postId, "comments"] as const,
  likes: (postId: string) => ["posts", postId, "likes"] as const,
  user: ["user"] as const,
} as const;
