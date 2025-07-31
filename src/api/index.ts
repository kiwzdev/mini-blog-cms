import { ApiResponse } from "@/types/api";
import axios from "axios";

export const handleApiError = async (error: unknown): Promise<ApiResponse> => {
  if (axios.isAxiosError(error) && error.response) {
    // ถ้า response เป็น HTML แสดงว่า API route ไม่มี
    if (error.response.headers["content-type"]?.includes("text/html")) {
      return {
        success: false,
        error: {
          code: "API_NOT_FOUND",
          message: "API endpoint not found",
        },
      };
    }

    return error.response.data;
  }

  return {
    success: false,
    error: {
      code: "NETWORK_ERROR",
      message: "Failed to connect to server",
    },
  };
};
