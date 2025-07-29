// API Functions for Social Media App

import { ICreatePostInput, IUpdatePostInput } from "@/types";
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

// For Post detail page - Full Info
export const getPostById = async (postId: string) => {
  const { data } = await axios.get(`/api/posts/${postId}`);
  return data; // PostWithFullDetails
};

// Post Actions
export const createPost = async (postData: ICreatePostInput) => {
  const { data } = await axios.post("/api/posts", postData);
  return data;
};

export const updatePost = async (
  postId: string,
  postData: IUpdatePostInput
) => {
  const { data } = await axios.put(`/api/posts/${postId}`, postData);
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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
