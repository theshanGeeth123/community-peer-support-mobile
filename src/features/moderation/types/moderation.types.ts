// --- Enums (mirrors backend moderation.constants.js) ------------------------

export type ReportStatus = "PENDING" | "REVIEWED";

export type ReportReason =
  | "HARMFUL_CONTENT"
  | "HATE_SPEECH"
  | "SPAM"
  | "MISINFORMATION"
  | "OTHER";

export type ModerationActionType =
  | "NO_ACTION"
  | "WARN"
  | "REMOVE";

export type ReportTargetType = "POST" | "COMMENT";

// --- Shared References -------------------------------------------------------

export interface ReporterSummary {
  id: string;
  fullName: string;
  email: string;
}

export interface ModeratorSummary {
  id: string;
  fullName: string;
  email: string;
}

export interface GroupSummary {
  id: string;
  name: string;
}

// --- Report ------------------------------------------------------------------

export interface Report {
  id: string;
  reporter: ReporterSummary;
  group: GroupSummary | string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  additionalDetails: string | null;
  status: ReportStatus;
  reviewedBy: ModeratorSummary | null;
  reviewedAt: string | null;
  createdAt: string;
}

// --- Moderation Action -------------------------------------------------------

export interface ModerationAction {
  id: string;
  moderator: ModeratorSummary;
  group: GroupSummary | string;
  report: string | Pick<Report, "id" | "reason" | "targetType">;
  targetType: ReportTargetType;
  targetId: string;
  action: ModerationActionType;
  reason: string;
  createdAt: string;
}

// --- Payloads ----------------------------------------------------------------

export interface SubmitReportPayload {
  groupId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  additionalDetails?: string;
}

export interface TakeActionPayload {
  action: ModerationActionType;
  reason: string;
}

// --- Query Params ------------------------------------------------------------

export interface ReportListParams {
  status?: ReportStatus;
  page?: number;
  limit?: number;
}

export interface HistoryListParams {
  groupId?: string;
  page?: number;
  limit?: number;
}

// --- Pagination --------------------------------------------------------------

export interface ReportPagination {
  page: number;
  limit: number;
  totalReports: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface HistoryPagination {
  page: number;
  limit: number;
  totalActions: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// --- Response Data -----------------------------------------------------------

export interface ReportsResponseData {
  reports: Report[];
  pagination: ReportPagination;
}

export interface HistoryResponseData {
  actions: ModerationAction[];
  pagination: HistoryPagination;
}
