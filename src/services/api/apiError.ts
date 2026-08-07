import axios from "axios";

interface ValidationError {
  field?: string;
  message?: string;
}

interface BackendErrorResponse {
  success?: boolean;
  message?: string;
  errors?: ValidationError[];
}

export const getApiErrorMessage = (
  error: unknown
): string => {
  if (axios.isAxiosError<BackendErrorResponse>(error)) {
    const validationMessage =
      error.response?.data?.errors?.[0]
        ?.message;

    if (validationMessage) {
      return validationMessage;
    }

    const backendMessage =
      error.response?.data?.message;

    if (backendMessage) {
      return backendMessage;
    }

    if (!error.response) {
      return (
        "Unable to connect to the server. " +
        "Check your network connection and make sure the backend is running."
      );
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};

export const isUnauthorizedError = (
  error: unknown
): boolean => {
  return (
    axios.isAxiosError(error) &&
    error.response?.status === 401
  );
};