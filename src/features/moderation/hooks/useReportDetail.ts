import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { getApiErrorMessage } from "@/services/api/apiError";

import { moderationApi } from "../api/moderation.api";

import type {
  ModerationActionSummary,
  ModerationActionType,
  Report,
} from "../types/moderation.types";

export function useReportDetail(reportId: string) {
  const [report, setReport] = useState<Report | null>(null);
  const [moderationAction, setModerationAction] =
    useState<ModerationActionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await moderationApi.getReportById(reportId);
      setReport(res.data.report);
      setModerationAction(res.data.moderationAction ?? null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    void fetchReport();
  }, [fetchReport]);

  const reviewReport = useCallback(
    async (action: ModerationActionType, reason: string) => {
      try {
        setReviewing(true);
        setReviewError(null);
        const res = await moderationApi.reviewReport(reportId, {
          action,
          reason,
        });
        setReport(res.data.report);
        // The review response also returns the new moderation action
        if (res.data.moderationAction) {
          setModerationAction(res.data.moderationAction);
        }
        return true;
      } catch (err) {
        setReviewError(getApiErrorMessage(err));
        return false;
      } finally {
        setReviewing(false);
      }
    },
    [reportId]
  );

  return {
    report,
    moderationAction,
    loading,
    error,
    reviewing,
    reviewError,
    reviewReport,
    refetch: fetchReport,
  };
}
