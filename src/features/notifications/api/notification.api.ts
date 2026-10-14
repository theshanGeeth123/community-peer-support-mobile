import apiClient from "@/services/api/apiClient";

import type { ApiResponse } from "@/features/auth/types/auth.types";

import type { NotificationsResponseData } from "../types/notification.types";

export const notificationApi = {
  async list(
    filters: { page?: number; limit?: number; unreadOnly?: boolean } = {}
  ): Promise<ApiResponse<NotificationsResponseData>> {
    const response = await apiClient.get<
      ApiResponse<NotificationsResponseData>
    >("/notifications", { params: filters });

    return response.data;
  },

  async getUnreadCount(): Promise<ApiResponse<{ unreadCount: number }>> {
    const response = await apiClient.get<
      ApiResponse<{ unreadCount: number }>
    >("/notifications/unread-count");

    return response.data;
  },

  async markRead(
    notificationId: string
  ): Promise<ApiResponse<{ id: string; isRead: boolean }>> {
    const response = await apiClient.patch<
      ApiResponse<{ id: string; isRead: boolean }>
    >(`/notifications/${notificationId}/read`);

    return response.data;
  },

  async markAllRead(): Promise<ApiResponse<{ updatedCount: number }>> {
    const response = await apiClient.patch<
      ApiResponse<{ updatedCount: number }>
    >("/notifications/read-all");

    return response.data;
  },
};
