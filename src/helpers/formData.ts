import { IUpdateProfileData, IUserSettings } from "@/types/user";


export const createUpdatedUserFormData = (data: IUpdateProfileData | IUserSettings): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (key === 'profileImage' && value instanceof File) {
      formData.append('profileImage', value);
    } else if (key === 'socialLinks' && value) {
      formData.append('socialLinks', JSON.stringify(value));
    } else if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  return formData;
};