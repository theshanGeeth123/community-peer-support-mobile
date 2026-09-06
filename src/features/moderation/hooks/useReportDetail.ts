import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { getApiErrorMessage } from "@/services/api/apiError";

import { moderationApi } from "../api/moderation.api";

import type {
  ModerationActionType,
  Report,
} from "../types/moderation.types";

export function useReportDetail(reportId: string) {
  const [report, setReport] = useState<Report | null>(null);
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
        // Replace local state with reviewed report from server
        setReport(res.data.report);
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
    loading,
    error,
    reviewing,
    reviewError,
    reviewReport,
    refetch: fetchReport,
  };
}
