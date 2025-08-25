// API Functions for Social Media App
import { ApiResponse } from "@/types/api";
import axios from "axios";
import { handleApiError } from "@/lib/api-response";
import { ICreateBlogInput, IUpdateBlogInput } from "@/types/blog";

// For Blog page
export const getAllBlogs = async (params?: {
  userId?: string;
  // Pagination
  limit?: number;
  page?: number;
  // Filters
  search?: string;
  category?: string;
  status?: string;
  // Sorting
  sortBy?: "createdAt" | "likes";
  sortOrder?: "asc" | "desc";
}): Promise<ApiResponse> => {
  try {
    const { data } = await axios.get("/api/blogs", { params });
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

// For Blog detail page - Full Info
export const getBlogById = async (blogId: string): Promise<ApiResponse> => {
  try {
    const { data } = await axios.get(`/api/blogs/${blogId}`);
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Blog Actions
export const createBlog = async (
  blogData: ICreateBlogInput
): Promise<ApiResponse> => {
  try {
    const { data } = await axios.post("/api/blogs", blogData);
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateBlog = async (
  blogId: string,
  blogData: IUpdateBlogInput
): Promise<ApiResponse> => {
  try {
    const { data } = await axios.put(`/api/blogs/${blogId}`, blogData);
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteBlog = async (id: string): Promise<ApiResponse> => {
  try {
    const { data } = await axios.delete(`/api/blogs/${id}`);
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};
