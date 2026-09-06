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
  ReportListParams,
  ReportPagination,
  ReportStatus,
} from "../types/moderation.types";

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);

  const [pagination, setPagination] =
    useState<ReportPagination | null>(null);

  const [statusFilter, setStatusFilter] =
    useState<ReportStatus | undefined>(undefined);

  const [loading, setLoading] = useState(true);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState<string | null>(null);

  const currentPageRef = useRef(1);

  const fetchReports = useCallback(
    async (
      page: number,
      status: ReportStatus | undefined,
      append: boolean
    ) => {
      try {
        const params: ReportListParams = {
          page,
          limit: 20,
        };

        if (status) {
          params.status = status;
        }

        const res =
          await moderationApi.getReports(params);

        if (append) {
          setReports((prev) => [
            ...prev,
            ...res.data.reports,
          ]);
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

  const loadInitial = useCallback(
    async (status: ReportStatus | undefined) => {
      setLoading(true);
      currentPageRef.current = 1;
      await fetchReports(1, status, false);
      setLoading(false);
    },
    [fetchReports]
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    currentPageRef.current = 1;
    await fetchReports(1, statusFilter, false);
    setRefreshing(false);
  }, [fetchReports, statusFilter]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !pagination?.hasNextPage) {
      return;
    }

    const nextPage = currentPageRef.current + 1;
    currentPageRef.current = nextPage;

    setLoadingMore(true);
    await fetchReports(nextPage, statusFilter, true);
    setLoadingMore(false);
  }, [loadingMore, pagination, fetchReports, statusFilter]);

  const changeFilter = useCallback(
    (status: ReportStatus | undefined) => {
      setStatusFilter(status);
      void loadInitial(status);
    },
    [loadInitial]
  );

  useFocusEffect(
    useCallback(() => {
      void loadInitial(statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter])
  );

  return {
    reports,
    pagination,
    statusFilter,
    loading,
    loadingMore,
    refreshing,
    error,
    refresh,
    loadMore,
    changeFilter,
  };
}
