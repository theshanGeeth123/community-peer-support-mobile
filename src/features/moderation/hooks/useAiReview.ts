import { useCallback, useState } from "react";

import { getApiErrorMessage } from "@/services/api/apiError";

import { moderationApi } from "../api/moderation.api";

import type { AiReview } from "../types/moderation.types";

export function useAiReview(reportId: string) {
  const [aiReview, setAiReview] = useState<AiReview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await moderationApi.getReportAiReview(reportId);
      setAiReview(res.data.aiReview);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  return {
    aiReview,
    loading,
    error,
    generate,
  };
}
