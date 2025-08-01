import { SignUpData } from "@/types/auth";
import { ApiResponse } from "@/types/api";
import { handleApiError } from "@/lib/api-response";
import axios from "axios";

export const signUp = async (userData: SignUpData): Promise<ApiResponse> => {
  try {
    const { data } = await axios.post("/api/auth/signup", userData);
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const forgotPassword = async (email: string): Promise<ApiResponse> => {
  try {
    const { data } = await axios.post("/api/auth/forgot-password", { email });
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const resetPassword = async (
  token: string | null,
  password: string
): Promise<ApiResponse> => {
  try {
    const { data } = await axios.post("/api/auth/reset-password", {
      token,
      password,
    });
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const verifyEmail = async (token: string): Promise<ApiResponse> => {
  try {
    const { data } = await axios.post("/api/auth/verify-email", { token });
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};
