import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { type Href, router } from "expo-router";

import { useReports } from "@/features/moderation/hooks/useReports";
import ReportCard from "@/features/moderation/components/ReportCard";

import type {
  Report,
  ReportStatus,
} from "@/features/moderation/types/moderation.types";

const FILTERS: { label: string; value: ReportStatus | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Pending", value: "PENDING" },
  { label: "Reviewed", value: "REVIEWED" },
];

export default function ModeratorReportsScreen() {
  const {
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
  } = useReports();

  function handlePressReport(report: Report) {
    const groupId =
      typeof report.group === "string"
        ? report.group
        : report.group.id;

    router.push(
      `/(app)/moderator/group/${groupId}/report/${report.id}` as Href
    );
  }

  const pendingCount = pagination
    ? undefined
    : undefined;

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={10}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#0f172a"
          />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Reports</Text>
          {pagination && (
            <Text style={styles.headerSub}>
              {pagination.totalReports} total
            </Text>
          )}
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* ── Filter chips ── */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = statusFilter === f.value;
          return (
            <Pressable
              key={String(f.value)}
              onPress={() => changeFilter(f.value)}
              style={[
                styles.filterChip,
                active && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterLabel,
                  active && styles.filterLabelActive,
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator
            size="large"
            color="#4f46e5"
          />
          <Text style={styles.loadingText}>
            Loading reports…
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <View style={styles.errorIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={36}
              color="#e11d48"
            />
          </View>
          <Text style={styles.errorTitle}>
            Failed to load reports
          </Text>
          <Text style={styles.errorSub}>{error}</Text>
          <Pressable
            onPress={() => changeFilter(statusFilter)}
            style={styles.retryBtn}
          >
            <Text style={styles.retryLabel}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ReportCard
              report={item}
              onPress={handlePressReport}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void refresh()}
              tintColor="#4f46e5"
            />
          }
          onEndReached={() => void loadMore()}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="flag-outline"
                  size={36}
                  color="#94a3b8"
                />
              </View>
              <Text style={styles.emptyTitle}>
                No reports found
              </Text>
              <Text style={styles.emptySub}>
                {statusFilter
                  ? `No ${statusFilter.toLowerCase()} reports for your groups.`
                  : "No reports have been submitted yet."}
              </Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator
                  size="small"
                  color="#4f46e5"
                />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
  },
  headerSub: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 1,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  filterChipActive: {
    borderColor: "#4f46e5",
    backgroundColor: "#eef2ff",
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  filterLabelActive: {
    color: "#4338ca",
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#94a3b8",
  },
  errorIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fff1f2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  errorSub: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 20,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#4f46e5",
  },
  retryLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  emptyBox: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 20,
  },
  loadingMore: {
    paddingVertical: 16,
    alignItems: "center",
  },
});
