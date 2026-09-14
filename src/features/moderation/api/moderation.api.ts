import apiClient from "@/services/api/apiClient";

import type { ApiResponse } from "@/features/auth/types/auth.types";

import type {
  ModerationActionSummary,
  Report,
  ReportListParams,
  ReportsResponseData,
  ReviewReportPayload,
  SubmitReportPayload,
} from "../types/moderation.types";

// ── Helper ─────────────────────────────────────────────────────────────────
// The backend Report model has no toSafeObject(), so Mongoose serialises
// documents with _id instead of id. We normalise here so the rest of the
// frontend can safely use report.id.

type RawWithId = { _id?: string; id?: string; [key: string]: unknown };

function coerceId<T extends RawWithId>(obj: T): T {
  if (obj && obj._id && !obj.id) {
    return { ...obj, id: String(obj._id) } as T;
  }
  return obj;
}

function normalizeReport(raw: Record<string, unknown>): Report {
  const r = coerceId(raw as RawWithId);

  if (r.reporter && typeof r.reporter === "object") {
    r.reporter = coerceId(r.reporter as RawWithId);
  }
  if (r.reviewedBy && typeof r.reviewedBy === "object") {
    r.reviewedBy = coerceId(r.reviewedBy as RawWithId);
  }
  if (r.group && typeof r.group === "object") {
    r.group = coerceId(r.group as RawWithId);
  }
  // Ensure targetId is a plain string (Mongoose ObjectId → string)
  if (r.targetId && typeof r.targetId !== "string") {
    r.targetId = String(r.targetId);
  }

  return r as unknown as Report;
}

export const moderationApi = {
  // --- Report: submit (USER / PEER_SUPPORTER / MODERATOR) -------------------

  async submitReport(
    payload: SubmitReportPayload
  ): Promise<ApiResponse<{ report: Report }>> {
    const response = await apiClient.post<
      ApiResponse<{ report: Report }>
    >("/reports", payload);

    const data = response.data;
    return { ...data, data: { report: normalizeReport(data.data.report as Record<string, unknown>) } };
  },

  // --- Moderation: list reports for assigned groups (MODERATOR) -------------

  async getReports(
    params: ReportListParams = {}
  ): Promise<ApiResponse<ReportsResponseData>> {
    const response = await apiClient.get<
      ApiResponse<ReportsResponseData>
    >("/reports", { params });

    const data = response.data;
    return {
      ...data,
      data: {
        ...data.data,
        reports: (data.data.reports as unknown as Record<string, unknown>[]).map(normalizeReport),
      },
    };
  },

  // --- Moderation: get single report detail (MODERATOR) --------------------

  async getReportById(
    reportId: string
  ): Promise<ApiResponse<{ report: Report; moderationAction: ModerationActionSummary | null }>> {
    const response = await apiClient.get<
      ApiResponse<{ report: Report; moderationAction: ModerationActionSummary | null }>
    >(`/reports/${reportId}`);

    const data = response.data;
    const rawAction = data.data.moderationAction as Record<string, unknown> | null;
    return {
      ...data,
      data: {
        report: normalizeReport(data.data.report as Record<string, unknown>),
        moderationAction: rawAction ? (coerceId(rawAction) as unknown as ModerationActionSummary) : null,
      },
    };
  },

  // --- Moderation: review a report (MODERATOR) -----------------------------
  // Backend route: POST /reports/:id/review

  async reviewReport(
    reportId: string,
    payload: ReviewReportPayload
  ): Promise<ApiResponse<{ report: Report; moderationAction: ModerationActionSummary | null }>> {
    const response = await apiClient.post<
      ApiResponse<{ report: Report; moderationAction: ModerationActionSummary | null }>
    >(`/reports/${reportId}/review`, payload);

    const data = response.data;
    const rawAction = data.data.moderationAction as Record<string, unknown> | null;
    return {
      ...data,
      data: {
        report: normalizeReport(data.data.report as Record<string, unknown>),
        moderationAction: rawAction ? (coerceId(rawAction) as unknown as ModerationActionSummary) : null,
      },
    };
  },

};
