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

import { useModerationHistory } from "@/features/moderation/hooks/useModerationHistory";
import ReportCard from "@/features/moderation/components/ReportCard";

import type { Report } from "@/features/moderation/types/moderation.types";

export default function ModeratorHistoryScreen() {
  const {
    reports,
    pagination,
    loading,
    loadingMore,
    refreshing,
    error,
    refresh,
    loadMore,
  } = useModerationHistory();

  function handlePressReport(report: Report) {
    const groupId =
      typeof report.group === "string"
        ? report.group
        : report.group.id;

    router.push(
      `/(app)/moderator/group/${groupId}/report/${report.id}` as Href
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Moderation History</Text>
          {pagination && (
            <Text style={styles.headerSub}>
              {pagination.totalReports} reviewed
            </Text>
          )}
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Info banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="checkmark-circle-outline" size={14} color="#059669" />
        <Text style={styles.infoBannerText}>
          Showing all reports you have reviewed
        </Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <View style={styles.errorIconWrap}>
            <Ionicons name="alert-circle-outline" size={36} color="#e11d48" />
          </View>
          <Text style={styles.errorTitle}>Failed to load history</Text>
          <Text style={styles.errorSub}>{error}</Text>
          <Pressable onPress={() => void refresh()} style={styles.retryBtn}>
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
              tintColor="#7c3aed"
            />
          }
          onEndReached={() => void loadMore()}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={styles.emptyIcon}>
                <Ionicons name="time-outline" size={36} color="#94a3b8" />
              </View>
              <Text style={styles.emptyTitle}>No history yet</Text>
              <Text style={styles.emptySub}>
                Reports you review will appear here once you take action on them.
              </Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color="#7c3aed" />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
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
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#0f172a" },
  headerSub: { fontSize: 12, color: "#94a3b8", marginTop: 1 },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f0fdf4",
    borderBottomWidth: 1,
    borderBottomColor: "#bbf7d0",
  },
  infoBannerText: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "500",
  },
  listContent: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14, color: "#94a3b8" },
  errorIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fff1f2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  errorTitle: { fontSize: 17, fontWeight: "700", color: "#0f172a", marginBottom: 6 },
  errorSub: { fontSize: 14, color: "#64748b", textAlign: "center", marginBottom: 20 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: "#7c3aed" },
  retryLabel: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  emptyBox: { alignItems: "center", paddingTop: 60 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#334155", marginBottom: 6 },
  emptySub: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 260,
  },
  loadingMore: { paddingVertical: 16, alignItems: "center" },
});