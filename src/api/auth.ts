import { signUpData } from "@/types";
import axios from "axios";

export const signUp = async (userData: signUpData) => {
  const { data } = await axios.post("/api/auth/sign-up", {
    ...userData,
  });
  return data;
};
