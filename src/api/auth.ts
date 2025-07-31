import { signUpData } from "@/types";
import { ApiResponse } from "@/types/api";
import { handleApiError } from ".";
import axios from "axios";

export const signUp = async (userData: signUpData): Promise<ApiResponse> => {
  try {
    const { data } = await axios.post("/api/auth/sign-up", {
      ...userData,
    });
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};
