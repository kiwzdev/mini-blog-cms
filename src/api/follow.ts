import { handleApiError } from "@/lib/api-response";
import { ApiResponse } from "@/types/api";
import axios from "axios";

// Follow User
export const toggleFollowUser = async (userId: string): Promise<ApiResponse> => {
  try {
    const { data } = await axios.post(`/api/users/${userId}/follow`);
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};