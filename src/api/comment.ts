import axios from "axios";

// Post Comments
export const getPostComments = async (postId: string, params?: {
  limit?: number;
  page?: number;
}) => {
  const { data } = await axios.get(`/api/posts/${postId}/comments`, { params });
  return data;
};

export const createPostComment = async (postId: string, commentData: {
  content: string;
  userId: string;
}) => {
  const { data } = await axios.post(`/api/posts/${postId}/comments`, commentData);
  return data;
};

export const editPostComment = async (postId: string, commentData: {
  content: string;
  userId: string;
}) => {
  const { data } = await axios.put(`/api/posts/${postId}/comments`, commentData);
  return data;
};

// User Comments
export const getUserComments = async (userId: string, params?: {
  limit?: number;
  page?: number;
}) => {
  const { data } = await axios.get(`/api/users/${userId}/comments`, { params });
  return data;
};

export const createUserComment = async (userId: string, commentData: {
  content: string;
  userId: string;
}) => {
  const { data } = await axios.post(`/api/users/${userId}/comments`, commentData);
  return data;
};

export const editUserComment = async (userId: string, commentData: {
  content: string;
  userId: string;
}) => {
  const { data } = await axios.put(`/api/users/${userId}/comments`, commentData);
  return data;
};

// Comment CRUD (แยก Resource)
export const getComment = async (commentId: string) => {
  const { data } = await axios.get(`/api/comments/${commentId}`);
  return data;
};

export const updateComment = async (commentId: string, content: string) => {
  const { data } = await axios.put(`/api/comments/${commentId}`, { content });
  return data;
};

export const deleteComment = async (commentId: string) => {
  const { data } = await axios.delete(`/api/comments/${commentId}`);
  return data;
};