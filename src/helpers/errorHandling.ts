function handleAPIError(error: unknown): {
  message: string;
  status: number;
  code?: string;
} {
  // Axios-like หรือ Fetch error response

  
  // JavaScript Error
  if (error instanceof Error) {
    return {
      message: error.message,
      status: 500,
      code: error.name,
    };
  }

  // String error
  if (typeof error === "string") {
    return {
      message: error,
      status: 500,
    };
  }

  // Unknown error
  return {
    message: "An unexpected error occurred",
    status: 500,
  };
}

export default handleAPIError;
