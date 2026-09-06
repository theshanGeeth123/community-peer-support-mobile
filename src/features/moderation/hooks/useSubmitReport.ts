import { useCallback, useState } from "react";

import { getApiErrorMessage } from "@/services/api/apiError";

import { moderationApi } from "../api/moderation.api";

import type { SubmitReportPayload } from "../types/moderation.types";

export function useSubmitReport() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitReport = useCallback(
    async (payload: SubmitReportPayload) => {
      try {
        setSubmitting(true);
        setError(null);
        setSuccess(false);
        await moderationApi.submitReport(payload);
        setSuccess(true);
        return true;
      } catch (err) {
        setError(getApiErrorMessage(err));
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    submitting,
    error,
    success,
    submitReport,
    reset,
  };
}
