export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: IError;
  message?: string; // เพิ่ม message สำหรับ success response
  meta?: Meta;
}

export interface Meta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface IError {
  code: string;
  message: string;
  details?: string;
}
