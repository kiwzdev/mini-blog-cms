import axios from "axios";

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: IError;
}

export interface IError {
  code: string;
  message: string;
  details?: string;
}
