import axios from "axios";

// Upload API Functions
export const uploadImage = async (file: File, oldPublicId?: string) => {
  const formData = new FormData();
  formData.append("file", file);
  if (oldPublicId) formData.append("oldPublicId", oldPublicId);

  const { data } = await axios.post("/api/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const uploadImages = async (files: File[]) => {
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
};
