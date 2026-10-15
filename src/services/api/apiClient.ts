import axios from "axios";

import { authStorage } from "@/storage/auth.storage";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL is not configured in .env.local"
  );
}

const apiClient = axios.create({
  baseURL: API_URL,

  timeout: 15000,

  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token =
      await authStorage.getToken();

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    /*
    |--------------------------------------------------------------------------
    | HANDLE MULTIPART / FORMDATA REQUESTS
    |--------------------------------------------------------------------------
    |
    | Normal API requests use:
    |
    | Content-Type: application/json
    |
    | But when FormData is being sent, Axios needs to
    | generate the multipart boundary automatically.
    |
    | Without this, the backend may receive the text
    | but req.files can be empty.
    |
    */

    if (
      config.data instanceof FormData
    ) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;