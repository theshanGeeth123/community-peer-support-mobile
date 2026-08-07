import apiClient from "@/services/api/apiClient";

import type {
    ApiResponse,
    AuthUser,
    ChangePasswordPayload,
    ForgotPasswordPayload,
    GoogleLoginPayload,
    GoogleLoginResponseData,
    LoginPayload,
    LoginResponseData,
    MessageResponse,
    RegisterPayload,
    RegisterResponseData,
    ResetPasswordPayload,
    UpdateProfilePayload,
    VerifyEmailPayload,
} from "../types/auth.types";

export const authApi = {
  async register(
    payload: RegisterPayload
  ): Promise<ApiResponse<RegisterResponseData>> {
    const response = await apiClient.post<
      ApiResponse<RegisterResponseData>
    >("/auth/register", payload);

    return response.data;
  },

  async verifyEmail(
    payload: VerifyEmailPayload
  ): Promise<ApiResponse<{ user: AuthUser }>> {
    const response = await apiClient.post<
      ApiResponse<{ user: AuthUser }>
    >("/auth/verify-email", payload);

    return response.data;
  },

  async resendVerificationOtp(
    email: string
  ): Promise<MessageResponse> {
    const response =
      await apiClient.post<MessageResponse>(
        "/auth/resend-verification-otp",
        {
          email,
        }
      );

    return response.data;
  },

  async login(
    payload: LoginPayload
  ): Promise<ApiResponse<LoginResponseData>> {
    const response = await apiClient.post<
      ApiResponse<LoginResponseData>
    >("/auth/login", payload);

    return response.data;
  },

  async googleLogin(
    payload: GoogleLoginPayload
  ): Promise<
    ApiResponse<GoogleLoginResponseData>
  > {
    const response = await apiClient.post<
      ApiResponse<GoogleLoginResponseData>
    >("/auth/google", payload);

    return response.data;
  },

  async forgotPassword(
    payload: ForgotPasswordPayload
  ): Promise<MessageResponse> {
    const response =
      await apiClient.post<MessageResponse>(
        "/auth/forgot-password",
        payload
      );

    return response.data;
  },

  async resetPassword(
    payload: ResetPasswordPayload
  ): Promise<MessageResponse> {
    const response =
      await apiClient.post<MessageResponse>(
        "/auth/reset-password",
        payload
      );

    return response.data;
  },

  async getCurrentUser(): Promise<
    ApiResponse<{ user: AuthUser }>
  > {
    const response = await apiClient.get<
      ApiResponse<{ user: AuthUser }>
    >("/auth/me");

    return response.data;
  },

  async updateProfile(
    payload: UpdateProfilePayload
  ): Promise<ApiResponse<{ user: AuthUser }>> {
    const response = await apiClient.patch<
      ApiResponse<{ user: AuthUser }>
    >("/auth/me", payload);

    return response.data;
  },

  async changePassword(
    payload: ChangePasswordPayload
  ): Promise<MessageResponse> {
    const response =
      await apiClient.patch<MessageResponse>(
        "/auth/change-password",
        payload
      );

    return response.data;
  },

  async logout(): Promise<MessageResponse> {
    const response =
      await apiClient.post<MessageResponse>(
        "/auth/logout"
      );

    return response.data;
  },

  async logoutAll(): Promise<MessageResponse> {
    const response =
      await apiClient.post<MessageResponse>(
        "/auth/logout-all"
      );

    return response.data;
  },
};