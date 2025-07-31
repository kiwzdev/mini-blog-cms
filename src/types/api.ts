export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: IError;
  message?: string; // เพิ่ม message สำหรับ success response
}

export interface IError {
  code: string;
  message: string;
  details?: string;
}
