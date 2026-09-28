import {
  useCallback,
  useRef,
  useState,
} from "react";

import { useFocusEffect } from "expo-router";

import { getApiErrorMessage } from "@/services/api/apiError";

import { moderationApi } from "../api/moderation.api";

import type {
  Report,
  ReportPagination,
} from "../types/moderation.types";

/**
 * Loads reviewed reports as the moderator history.
 *
 * NOTE: The backend does not expose a dedicated GET /moderation/history
 * endpoint. ModerationAction records are created internally when a report
 * is reviewed (see report.controller.js → reviewReport), but there is no
 * route to query them. We therefore derive "history" from
 * GET /reports?status=REVIEWED, which includes reviewedBy + reviewedAt.
 */
export function useModerationHistory() {
  const [reports, setReports] = useState<Report[]>([]);
  const [pagination, setPagination] = useState<ReportPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPageRef = useRef(1);

  const fetchHistory = useCallback(
    async (page: number, append: boolean) => {
      try {
        const res = await moderationApi.getReports({
          status: "REVIEWED",
          page,
          limit: 20,
        });

        if (append) {
          setReports((prev) => [...prev, ...res.data.reports]);
        } else {
          setReports(res.data.reports);
        }

        setPagination(res.data.pagination);
        setError(null);
      } catch (err) {
        setError(getApiErrorMessage(err));
      }
    },
    []
  );

  const loadInitial = useCallback(async () => {
    setLoading(true);
    currentPageRef.current = 1;
    await fetchHistory(1, false);
    setLoading(false);
  }, [fetchHistory]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    currentPageRef.current = 1;
    await fetchHistory(1, false);
    setRefreshing(false);
  }, [fetchHistory]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !pagination?.hasNextPage) {
      return;
    }
    const nextPage = currentPageRef.current + 1;
    currentPageRef.current = nextPage;
    setLoadingMore(true);
    await fetchHistory(nextPage, true);
    setLoadingMore(false);
  }, [loadingMore, pagination, fetchHistory]);

  useFocusEffect(
    useCallback(() => {
      void loadInitial();
    }, [loadInitial])
  );

  return {
    reports,
    pagination,
    loading,
    loadingMore,
    refreshing,
    error,
    refresh,
    loadMore,
  };
}