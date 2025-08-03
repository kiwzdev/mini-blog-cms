import { ApiResponse, Meta } from "@/types/api";
import axios from "axios";
import { NextResponse } from "next/server";

export const handleApiSuccess = (data: ApiResponse): ApiResponse => data;

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

export function createSuccessResponse({
  data,
  message,
  meta,
  status = 200,
}: {
  data?: any;
  message?: string;
  meta?: Meta;
  status?: number;
} = {}) {
  return NextResponse.json(
    {
      success: true,
      ...(data && { data }),
      ...(message && { message }),
      ...(meta && { meta }),
    } as ApiResponse,
    { status }
  );
}

export function createErrorResponse({
  code,
  message,
  status = 500,
  details,
}: {
  code: string;
  message: string;
  status?: number;
  details?: string;
}) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    } as ApiResponse,
    { status }
  );
}
