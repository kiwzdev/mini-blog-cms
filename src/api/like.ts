import axios from "axios";

// Post Like Actions (สำหรับการกระทำ)
export const likePost = async (postId: string) => {
  const { data } = await axios.post(`/api/posts/${postId}/like`);
  return data;
};

export const unlikePost = async (postId: string) => {
  const { data } = await axios.delete(`/api/posts/${postId}/like`);
  return data;
};

// User Like Actions (สำหรับการกระทำ)
export const likeUser = async (userId: string) => {
  const { data } = await axios.post(`/api/users/${userId}/like`);
  return data;
};

export const unlikeUser = async (userId: string) => {
  const { data } = await axios.delete(`/api/users/${userId}/like`);
  return data;
};

// Like Details (เฉพาะเมื่อต้องการรายละเอียด เช่น "ใครบ้างที่ไลค์")
export const getPostLikes = async (postId: string, params?: {
  limit?: number;
  page?: number;
}) => {
  const { data } = await axios.get(`/api/posts/${postId}/likes`, { params });
  return data;
};

export const getUserLikes = async (userId: string, params?: {
  limit?: number;
  page?: number;
}) => {
  const { data } = await axios.get(`/api/users/${userId}/likes`, { params });
  return data;
};