import apiClient from "@/services/api/apiClient";

import type { ApiResponse } from "@/features/auth/types/auth.types";

import type {
  HistoryListParams,
  HistoryResponseData,
  ModerationAction,
  Report,
  ReportListParams,
  ReportsResponseData,
  SubmitReportPayload,
  TakeActionPayload,
} from "../types/moderation.types";

export const moderationApi = {
  // --- Report: submit (USER / PEER_SUPPORTER / MODERATOR) -------------------

  async submitReport(
    payload: SubmitReportPayload
  ): Promise<ApiResponse<{ report: Report }>> {
    const response = await apiClient.post<
      ApiResponse<{ report: Report }>
    >("/reports", payload);

    return response.data;
  },

  // --- Moderation: list reports for assigned groups (MODERATOR) -------------

  async getReports(
    params: ReportListParams = {}
  ): Promise<ApiResponse<ReportsResponseData>> {
    const response = await apiClient.get<
      ApiResponse<ReportsResponseData>
    >("/reports", { params });

    return response.data;
  },

  // --- Moderation: get single report detail (MODERATOR) --------------------

  async getReportById(
    reportId: string
  ): Promise<ApiResponse<{ report: Report }>> {
    const response = await apiClient.get<
      ApiResponse<{ report: Report }>
    >(`/reports/${reportId}`);

    return response.data;
  },

  // --- Moderation: take action on a report (MODERATOR) ---------------------

  async takeAction(
    reportId: string,
    payload: TakeActionPayload
  ): Promise<ApiResponse<{ action: ModerationAction }>> {
    const response = await apiClient.post<
      ApiResponse<{ action: ModerationAction }>
    >(`/reports/${reportId}/action`, payload);

    return response.data;
  },

  // --- Moderation: get action history (MODERATOR) --------------------------

  async getModerationHistory(
    params: HistoryListParams = {}
  ): Promise<ApiResponse<HistoryResponseData>> {
    const response = await apiClient.get<
      ApiResponse<HistoryResponseData>
    >("/moderation/history", { params });

    return response.data;
  },
};
