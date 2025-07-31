import { ApiResponse } from "@/types/api";
import axios from "axios";
import { handleApiError } from ".";

// Upload API Functions
export const uploadImage = async (
  file: File,
  oldPublicId?: string
): Promise<ApiResponse> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    if (oldPublicId) formData.append("oldPublicId", oldPublicId);

    const { data } = await axios.post("/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const uploadImages = async (files: File[]): Promise<ApiResponse> => {
  try {
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
  } catch (error) {
    return handleApiError(error);
  }
};
