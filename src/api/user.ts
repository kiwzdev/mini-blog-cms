import axios from "axios";

// For User profile page
export const getUserPosts = async (userId: string) => {
  const { data } = await axios.get("/api/posts", {
    params: { userId },
  });
  return data;
};

// For User profile page
export const getUserProfile = async (userId: string) => {
  const { data } = await axios.get(`/api/users/${userId}/profile`);
  return data; // รวม user info + stats + recent posts
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
) => {
  const { data } = await axios.put(`/api/users/${userId}`, userData);
  return data;
};

export const deleteUser = async (userId: string) => {
  const { data } = await axios.delete(`/api/users/${userId}`);
  return data;
};

// For Admin dashboard page
export const getUsers = async (params?: {
  search?: string;
  limit?: number;
  page?: number;
}) => {
  const { data } = await axios.get("/api/users", { params });
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

// Types for better TypeScript support
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  coverImage?: string;
  bio?: string;
  verified?: boolean;
  createdAt: string;
  updatedAt: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
  isFollower?: boolean;
}

export interface UserStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  likesReceived: number;
  commentsReceived: number;
}

export interface FollowData {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
  follower?: User;
  following?: User;
}

export interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  postId: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
