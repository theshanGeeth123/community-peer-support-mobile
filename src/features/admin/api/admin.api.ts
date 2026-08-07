import apiClient from "@/services/api/apiClient";

import type {
    AccountStatus,
    ApiResponse,
    UserRole,
} from "@/features/auth/types/auth.types";

import type {
    AdminUser,
    UserFilters,
    UsersResponseData,
} from "../types/admin.types";

export const adminApi = {
  async getUsers(
    filters: UserFilters = {}
  ): Promise<
    ApiResponse<UsersResponseData>
  > {
    const response = await apiClient.get<
      ApiResponse<UsersResponseData>
    >("/admin/users", {
      params: filters,
    });

    return response.data;
  },

  async getUser(
    userId: string
  ): Promise<
    ApiResponse<{
      user: AdminUser;
    }>
  > {
    const response = await apiClient.get<
      ApiResponse<{
        user: AdminUser;
      }>
    >(`/admin/users/${userId}`);

    return response.data;
  },

  async updateRole(
    userId: string,
    role: UserRole
  ): Promise<
    ApiResponse<{
      user: AdminUser;
    }>
  > {
    const response =
      await apiClient.patch<
        ApiResponse<{
          user: AdminUser;
        }>
      >(
        `/admin/users/${userId}/role`,
        {
          role,
        }
      );

    return response.data;
  },

  async updateStatus(
    userId: string,
    accountStatus: AccountStatus
  ): Promise<
    ApiResponse<{
      user: AdminUser;
    }>
  > {
    const response =
      await apiClient.patch<
        ApiResponse<{
          user: AdminUser;
        }>
      >(
        `/admin/users/${userId}/status`,
        {
          accountStatus,
        }
      );

    return response.data;
  },

  async revokeSessions(
    userId: string
  ): Promise<
    ApiResponse<{
      revokedSessionCount: number;
    }>
  > {
    const response =
      await apiClient.post<
        ApiResponse<{
          revokedSessionCount: number;
        }>
      >(
        `/admin/users/${userId}/revoke-sessions`
      );

    return response.data;
  },
};