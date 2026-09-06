import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { useReportDetail } from "@/features/moderation/hooks/useReportDetail";
import ReasonBadge from "@/features/moderation/components/ReasonBadge";
import ReportStatusBadge from "@/features/moderation/components/ReportStatusBadge";

import { groupApi } from "@/features/groups/api/group.api";
import { postApi } from "@/features/groups/api/post.api";

import type { ModerationActionType } from "@/features/moderation/types/moderation.types";
import type { Post } from "@/features/groups/types/post.types";

// Only NO_ACTION and REMOVE — Issue Warning is removed
const ACTION_OPTIONS = [
  {
    value: "NO_ACTION" as ModerationActionType,
    label: "No Action",
    description: "Dismiss the report — content is acceptable.",
    icon: "checkmark-circle-outline" as const,
    iconBg: "#f0fdf4",
    iconColor: "#16a34a",
    selectedBorder: "#16a34a",
    selectedBg: "#f0fdf4",
  },
  {
    value: "REMOVE" as ModerationActionType,
    label: "Remove Content",
    description: "Permanently remove the reported content.",
    icon: "trash-outline" as const,
    iconBg: "#fff1f2",
    iconColor: "#e11d48",
    selectedBorder: "#e11d48",
    selectedBg: "#fff1f2",
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ModeratorReportDetailScreen() {
  const params = useLocalSearchParams();

  const reportId = Array.isArray(params.reportId)
    ? params.reportId[0]
    : params.reportId;

  const groupId = Array.isArray(params.groupId)
    ? params.groupId[0]
    : params.groupId;

  const { report, loading, error, reviewing, reviewError, reviewReport, refetch } =
    useReportDetail(reportId);

  const [selectedAction, setSelectedAction] = useState<ModerationActionType | null>(null);
  const [reason, setReason] = useState("");
  const [groupName, setGroupName] = useState<string | null>(null);
  const [reportedPost, setReportedPost] = useState<Post | null>(null);
  const [postLoading, setPostLoading] = useState(false);

  useEffect(() => {
    if (!groupId) return;
    groupApi
      .getGroup(groupId)
      .then((res) => setGroupName(res.data.group.name))
      .catch(() => setGroupName(null));
  }, [groupId]);

  const fetchPost = useCallback(async () => {
    if (!report || report.targetType !== "POST" || !report.targetId) return;
    try {
      setPostLoading(true);
      const res = await postApi.getPost(report.targetId);
      setReportedPost(res.data.post);
    } catch {
      setReportedPost(null);
    } finally {
      setPostLoading(false);
    }
  }, [report]);

  useEffect(() => {
    void fetchPost();
  }, [fetchPost]);

  async function handleSubmit() {
    if (!selectedAction) {
      Alert.alert("Select an Action", "Please choose an action before submitting.");
      return;
    }
    if (reason.trim().length < 10) {
      Alert.alert("Reason Required", "Please enter at least 10 characters for the reason.");
      return;
    }
    const ok = await reviewReport(selectedAction, reason.trim());
    if (ok) {
      setSelectedAction(null);
      setReason("");
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#0f172a" />
          </Pressable>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading report...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !report) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#0f172a" />
          </Pressable>
        </View>
        <View style={styles.centered}>
          <View style={styles.errorIconWrap}>
            <Ionicons name="alert-circle-outline" size={36} color="#e11d48" />
          </View>
          <Text style={styles.errorTitle}>Failed to load report</Text>
          <Text style={styles.errorSub}>{error ?? "Unknown error"}</Text>
          <Pressable onPress={() => void refetch()} style={styles.retryBtn}>
            <Text style={styles.retryLabel}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isPending = report.status === "PENDING";
  const displayGroupName =
    groupName ??
    (typeof report.group === "string" ? null : report.group.name) ??
    groupId ??
    "—";

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color="#0f172a" />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Report Detail</Text>
          </View>
          <ReportStatusBadge status={report.status} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Report Meta */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Reported Content</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Type</Text>
              <View style={[styles.targetPill, report.targetType === "POST" ? styles.targetPost : styles.targetComment]}>
                <Ionicons
                  name={report.targetType === "POST" ? "document-text-outline" : "chatbubble-outline"}
                  size={12}
                  color={report.targetType === "POST" ? "#4f46e5" : "#0891b2"}
                />
                <Text style={[styles.targetLabel, report.targetType === "POST" ? styles.targetPostLabel : styles.targetCommentLabel]}>
                  {report.targetType}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Reason</Text>
              <ReasonBadge reason={report.reason} />
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Group</Text>
              <Text style={styles.infoVal} numberOfLines={1}>{displayGroupName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Reported</Text>
              <Text style={styles.infoVal}>{formatDate(report.createdAt)}</Text>
            </View>
            {report.additionalDetails ? (
              <View style={styles.detailsBox}>
                <Text style={styles.detailsLabel}>Reporter Note</Text>
                <Text style={styles.detailsText}>{report.additionalDetails}</Text>
              </View>
            ) : null}
          </View>

          {/* Post Content */}
          {report.targetType === "POST" && (
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>Post Content</Text>
              {postLoading ? (
                <View style={styles.postLoadingRow}>
                  <ActivityIndicator size="small" color="#94a3b8" />
                  <Text style={styles.postLoadingText}>Loading post...</Text>
                </View>
              ) : reportedPost ? (
                <>
                  <View style={styles.postAuthorRow}>
                    <View style={styles.postAvatar}>
                      <Text style={styles.postAvatarText}>
                        {reportedPost.author.id === null ? "?" : reportedPost.author.fullName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.postAuthorName}>{reportedPost.author.fullName}</Text>
                      {reportedPost.isAnonymous && (
                        <Text style={styles.anonBadge}>Anonymous post</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.postContentBox}>
                    <Text style={styles.postContentText}>{reportedPost.content}</Text>
                  </View>
                </>
              ) : (
                <Text style={styles.postUnavailable}>
                  Post content could not be loaded. It may have been deleted.
                </Text>
              )}
            </View>
          )}

          {/* Reporter */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Reporter</Text>
            <View style={styles.personRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarLetter}>{report.reporter.fullName.charAt(0).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.personName}>{report.reporter.fullName}</Text>
                <Text style={styles.personEmail}>{report.reporter.email}</Text>
              </View>
            </View>
          </View>

          {/* Already reviewed */}
          {!isPending && report.reviewedBy ? (
            <View style={[styles.card, styles.reviewedCard]}>
              <View style={styles.reviewedHeader}>
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                <Text style={styles.reviewedTitle}>Already Reviewed</Text>
              </View>
              <View style={styles.personRow}>
                <View style={[styles.avatarCircle, styles.avatarGreen]}>
                  <Text style={[styles.avatarLetter, { color: "#065f46" }]}>{report.reviewedBy.fullName.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={styles.personName}>{report.reviewedBy.fullName}</Text>
                  <Text style={styles.personEmail}>{report.reviewedAt ? formatDate(report.reviewedAt) : "—"}</Text>
                </View>
              </View>
            </View>
          ) : null}

          {/* Review form */}
          {isPending ? (
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>Take Action</Text>
              {ACTION_OPTIONS.map((opt) => {
                const selected = selectedAction === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setSelectedAction(opt.value)}
                    style={[styles.actionOption, selected && { borderColor: opt.selectedBorder, backgroundColor: opt.selectedBg }]}
                  >
                    <View style={[styles.actionIcon, { backgroundColor: opt.iconBg }]}>
                      <Ionicons name={opt.icon} size={22} color={opt.iconColor} />
                    </View>
                    <View style={styles.actionTextWrap}>
                      <Text style={[styles.actionLabel, selected && { color: opt.selectedBorder }]}>{opt.label}</Text>
                      <Text style={styles.actionDesc}>{opt.description}</Text>
                    </View>
                    {selected
                      ? <Ionicons name="checkmark-circle" size={20} color={opt.selectedBorder} />
                      : <View style={styles.radioOuter} />
                    }
                  </Pressable>
                );
              })}

              <Text style={[styles.infoKey, { marginTop: 20, marginBottom: 8 }]}>
                Reason <Text style={{ color: "#e11d48" }}>*</Text>
              </Text>
              <TextInput
                style={styles.reasonInput}
                placeholder="Explain your decision (min. 10 characters)..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
                value={reason}
                onChangeText={setReason}
                textAlignVertical="top"
              />

              {reviewError ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle-outline" size={16} color="#dc2626" />
                  <Text style={styles.errorText}>{reviewError}</Text>
                </View>
              ) : null}

              <Pressable
                onPress={() => void handleSubmit()}
                disabled={reviewing}
                style={({ pressed }) => [styles.submitBtn, pressed && styles.submitPressed, reviewing && styles.submitDisabled]}
              >
                {reviewing
                  ? <ActivityIndicator size="small" color="#fff" />
                  : (<><Ionicons name="shield-checkmark" size={16} color="#fff" /><Text style={styles.submitLabel}>Submit Review</Text></>)
                }
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  headerRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#e2e8f0", backgroundColor: "#ffffff" },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#0f172a" },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 40 },
  card: { backgroundColor: "#ffffff", borderRadius: 20, borderWidth: 1, borderColor: "#e2e8f0", padding: 16 },
  reviewedCard: { borderColor: "#a7f3d0", backgroundColor: "#f0fdf4" },
  reviewedHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  reviewedTitle: { fontSize: 15, fontWeight: "700", color: "#065f46" },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 14 },
  infoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  infoKey: { fontSize: 13, fontWeight: "600", color: "#64748b" },
  infoVal: { fontSize: 13, color: "#334155", fontWeight: "500", flexShrink: 1, textAlign: "right", marginLeft: 8 },
  targetPill: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  targetPost: { backgroundColor: "#ede9fe" },
  targetComment: { backgroundColor: "#cffafe" },
  targetLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.3 },
  targetPostLabel: { color: "#4f46e5" },
  targetCommentLabel: { color: "#0891b2" },
  detailsBox: { backgroundColor: "#f8fafc", borderRadius: 12, padding: 12, marginTop: 4 },
  detailsLabel: { fontSize: 11, fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  detailsText: { fontSize: 14, color: "#334155", lineHeight: 20 },
  postLoadingRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8 },
  postLoadingText: { fontSize: 13, color: "#94a3b8" },
  postAuthorRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  postAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#ede9fe", alignItems: "center", justifyContent: "center" },
  postAvatarText: { fontSize: 14, fontWeight: "700", color: "#4f46e5" },
  postAuthorName: { fontSize: 13, fontWeight: "700", color: "#0f172a" },
  anonBadge: { fontSize: 11, color: "#94a3b8", marginTop: 1 },
  postContentBox: { backgroundColor: "#f8fafc", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  postContentText: { fontSize: 14, color: "#334155", lineHeight: 22 },
  postUnavailable: { fontSize: 13, color: "#94a3b8", fontStyle: "italic" },
  personRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#ede9fe", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarGreen: { backgroundColor: "#d1fae5" },
  avatarLetter: { fontSize: 18, fontWeight: "700", color: "#4f46e5" },
  personName: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  personEmail: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  actionOption: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1.5, borderColor: "#e2e8f0", padding: 14, marginBottom: 10, backgroundColor: "#f8fafc" },
  actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  actionTextWrap: { flex: 1 },
  actionLabel: { fontSize: 14, fontWeight: "700", color: "#0f172a", marginBottom: 2 },
  actionDesc: { fontSize: 12, color: "#64748b", lineHeight: 16 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#cbd5e1", flexShrink: 0 },
  reasonInput: { borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 14, padding: 12, fontSize: 14, color: "#0f172a", minHeight: 100, backgroundColor: "#f8fafc" },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fef2f2", borderRadius: 12, padding: 12, marginTop: 12 },
  errorText: { fontSize: 13, color: "#dc2626", flex: 1 },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#4f46e5", borderRadius: 16, paddingVertical: 15, marginTop: 20 },
  submitPressed: { opacity: 0.85 },
  submitDisabled: { opacity: 0.6 },
  submitLabel: { fontSize: 15, fontWeight: "700", color: "#ffffff" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14, color: "#94a3b8" },
  errorIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#fff1f2", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  errorTitle: { fontSize: 17, fontWeight: "700", color: "#0f172a", marginBottom: 6 },
  errorSub: { fontSize: 14, color: "#64748b", textAlign: "center", marginBottom: 20 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: "#4f46e5" },
  retryLabel: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
});