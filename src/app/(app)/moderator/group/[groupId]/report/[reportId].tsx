import { useThemeTone, useThemedStyles } from '@/theme/useAlyvenAppearance';
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
import { useAiReview } from "@/features/moderation/hooks/useAiReview";
import AiReviewCard from "@/features/moderation/components/AiReviewCard";
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

const ACTION_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  NO_ACTION: { label: "No Action Taken",  color: "#16a34a", bg: "#f0fdf4" },
  WARN:      { label: "Warning Issued",   color: "#d97706", bg: "#fffbeb" },
  REMOVE:    { label: "Content Removed",  color: "#e11d48", bg: "#fff1f2" },
};

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
  const themeStyles = useThemedStyles(styles);
  const themeTone = useThemeTone();

  const params = useLocalSearchParams();

  const reportId = Array.isArray(params.reportId)
    ? params.reportId[0]
    : params.reportId;

  const groupId = Array.isArray(params.groupId)
    ? params.groupId[0]
    : params.groupId;

  const { report, moderationAction, loading, error, reviewing, reviewError, reviewReport, refetch } =
    useReportDetail(reportId);

  const { aiReview, loading: aiLoading, error: aiError, generate: generateAiReview } =
    useAiReview(reportId);

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
      <SafeAreaView style={themeStyles.container} edges={["top"]}>
        <View style={themeStyles.headerRow}>
          <Pressable onPress={() => router.back()} style={themeStyles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={themeTone("#0E2A47", "color")} />
          </Pressable>
        </View>
        <View style={themeStyles.centered}>
          <ActivityIndicator size="large" color={themeTone("#0E7C86", "color")} />
          <Text style={themeStyles.loadingText}>Loading report...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !report) {
    return (
      <SafeAreaView style={themeStyles.container} edges={["top"]}>
        <View style={themeStyles.headerRow}>
          <Pressable onPress={() => router.back()} style={themeStyles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={themeTone("#0E2A47", "color")} />
          </Pressable>
        </View>
        <View style={themeStyles.centered}>
          <View style={themeStyles.errorIconWrap}>
            <Ionicons name="alert-circle-outline" size={36} color={themeTone("#e11d48", "color")} />
          </View>
          <Text style={themeStyles.errorTitle}>Failed to load report</Text>
          <Text style={themeStyles.errorSub}>{error ?? "Unknown error"}</Text>
          <Pressable onPress={() => void refetch()} style={themeStyles.retryBtn}>
            <Text style={themeStyles.retryLabel}>Retry</Text>
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
    <SafeAreaView style={themeStyles.container} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={themeStyles.headerRow}>
          <Pressable onPress={() => router.back()} style={themeStyles.backBtn} hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color={themeTone("#0E2A47", "color")} />
          </Pressable>
          <View style={themeStyles.headerCenter}>
            <Text style={themeStyles.headerTitle}>Report Detail</Text>
          </View>
          <ReportStatusBadge status={report.status} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={themeStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Report Meta */}
          <View style={themeStyles.card}>
            <Text style={themeStyles.sectionLabel}>Reported Content</Text>
            <View style={themeStyles.infoRow}>
              <Text style={themeStyles.infoKey}>Type</Text>
              <View style={[themeStyles.targetPill, report.targetType === "POST" ? themeStyles.targetPost : themeStyles.targetComment]}>
                <Ionicons
                  name={report.targetType === "POST" ? "document-text-outline" : "chatbubble-outline"}
                  size={12}
                  color={report.targetType === "POST" ? "#0E7C86" : "#0E7C86"}
                />
                <Text style={[themeStyles.targetLabel, report.targetType === "POST" ? themeStyles.targetPostLabel : themeStyles.targetCommentLabel]}>
                  {report.targetType}
                </Text>
              </View>
            </View>
            <View style={themeStyles.infoRow}>
              <Text style={themeStyles.infoKey}>Reason</Text>
              <ReasonBadge reason={report.reason} />
            </View>
            <View style={themeStyles.infoRow}>
              <Text style={themeStyles.infoKey}>Group</Text>
              <Text style={themeStyles.infoVal} numberOfLines={1}>{displayGroupName}</Text>
            </View>
            <View style={themeStyles.infoRow}>
              <Text style={themeStyles.infoKey}>Reported</Text>
              <Text style={themeStyles.infoVal}>{formatDate(report.createdAt)}</Text>
            </View>
            {report.additionalDetails ? (
              <View style={themeStyles.detailsBox}>
                <Text style={themeStyles.detailsLabel}>Reporter Note</Text>
                <Text style={themeStyles.detailsText}>{report.additionalDetails}</Text>
              </View>
            ) : null}
          </View>

          {/* Post Content */}
          {report.targetType === "POST" && (
            <View style={themeStyles.card}>
              <Text style={themeStyles.sectionLabel}>Post Content</Text>
              {postLoading ? (
                <View style={themeStyles.postLoadingRow}>
                  <ActivityIndicator size="small" color={themeTone("#8BA3AB", "color")} />
                  <Text style={themeStyles.postLoadingText}>Loading post...</Text>
                </View>
              ) : reportedPost ? (
                <>
                  <View style={themeStyles.postAuthorRow}>
                    <View style={themeStyles.postAvatar}>
                      <Text style={themeStyles.postAvatarText}>
                        {reportedPost.author.id === null ? "?" : reportedPost.author.fullName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={themeStyles.postAuthorName}>{reportedPost.author.fullName}</Text>
                      {reportedPost.isAnonymous && (
                        <Text style={themeStyles.anonBadge}>Anonymous post</Text>
                      )}
                    </View>
                  </View>
                  <View style={themeStyles.postContentBox}>
                    <Text style={themeStyles.postContentText}>{reportedPost.content}</Text>
                  </View>
                </>
              ) : (
                <Text style={themeStyles.postUnavailable}>
                  Post content could not be loaded. It may have been deleted.
                </Text>
              )}
            </View>
          )}

          {/* Reporter */}
          <View style={themeStyles.card}>
            <Text style={themeStyles.sectionLabel}>Reporter</Text>
            <View style={themeStyles.personRow}>
              <View style={themeStyles.avatarCircle}>
                <Text style={themeStyles.avatarLetter}>{report.reporter.fullName.charAt(0).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={themeStyles.personName}>{report.reporter.fullName}</Text>
                <Text style={themeStyles.personEmail}>{report.reporter.email}</Text>
              </View>
            </View>
          </View>

          {/* Already reviewed */}
          {!isPending && report.reviewedBy ? (
            <View style={[themeStyles.card, themeStyles.reviewedCard]}>
              <View style={themeStyles.reviewedHeader}>
                <Ionicons name="checkmark-circle" size={20} color={themeTone("#10b981", "color")} />
                <Text style={themeStyles.reviewedTitle}>Already Reviewed</Text>
              </View>

              {/* Who reviewed it */}
              <View style={themeStyles.personRow}>
                <View style={[themeStyles.avatarCircle, themeStyles.avatarGreen]}>
                  <Text style={[themeStyles.avatarLetter, { color: themeTone("#065f46", "color") }]}>{report.reviewedBy.fullName.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={themeStyles.personName}>{report.reviewedBy.fullName}</Text>
                  <Text style={themeStyles.personEmail}>{report.reviewedAt ? formatDate(report.reviewedAt) : "—"}</Text>
                </View>
              </View>

              {/* Action taken */}
              {moderationAction ? (() => {
                const meta = ACTION_LABELS[moderationAction.action] ?? { label: moderationAction.action, color: "#64808C", bg: "#EDF5F4" };
                return (
                  <>
                    <View style={themeStyles.actionDecisionRow}>
                      <Text style={themeStyles.infoKey}>Decision</Text>
                      <View style={[themeStyles.actionDecisionBadge, { backgroundColor: meta.bg }]}>
                        <Text style={[themeStyles.actionDecisionLabel, { color: meta.color }]}>{meta.label}</Text>
                      </View>
                    </View>

                    <View style={themeStyles.reviewReasonBox}>
                      <Text style={themeStyles.reviewReasonTitle}>Moderator's Reason</Text>
                      <Text style={themeStyles.reviewReasonText}>{moderationAction.reason}</Text>
                    </View>
                  </>
                );
              })() : null}
            </View>
          ) : null}

          {/* AI Review — on-demand, only for PENDING reports */}
          {isPending && (
            <AiReviewCard
              aiReview={aiReview}
              loading={aiLoading}
              error={aiError}
              onGenerate={() => void generateAiReview()}
            />
          )}

          {/* Review form */}
          {isPending ? (
            <View style={themeStyles.card}>
              <Text style={themeStyles.sectionLabel}>Take Action</Text>
              {ACTION_OPTIONS.map((opt) => {
                const selected = selectedAction === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setSelectedAction(opt.value)}
                    style={[themeStyles.actionOption, selected && { borderColor: opt.selectedBorder, backgroundColor: opt.selectedBg }]}
                  >
                    <View style={[themeStyles.actionIcon, { backgroundColor: opt.iconBg }]}>
                      <Ionicons name={opt.icon} size={22} color={opt.iconColor} />
                    </View>
                    <View style={themeStyles.actionTextWrap}>
                      <Text style={[themeStyles.actionLabel, selected && { color: opt.selectedBorder }]}>{opt.label}</Text>
                      <Text style={themeStyles.actionDesc}>{opt.description}</Text>
                    </View>
                    {selected
                      ? <Ionicons name="checkmark-circle" size={20} color={opt.selectedBorder} />
                      : <View style={themeStyles.radioOuter} />
                    }
                  </Pressable>
                );
              })}

              <Text style={[themeStyles.infoKey, { marginTop: 20, marginBottom: 8 }]}>
                Reason <Text style={{ color: themeTone("#e11d48", "color") }}>*</Text>
              </Text>
              <TextInput
                style={themeStyles.reasonInput}
                placeholder="Explain your decision (min. 10 characters)..."
                placeholderTextColor={themeTone("#8BA3AB", "placeholderTextColor")}
                multiline
                numberOfLines={4}
                value={reason}
                onChangeText={setReason}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text
                style={[
                  themeStyles.charCounter,
                  reason.length > 450 && { color: themeTone("#e11d48", "color") },
                ]}
              >
                {reason.length} / 500
              </Text>

              {reviewError ? (
                <View style={themeStyles.errorBox}>
                  <Ionicons name="alert-circle-outline" size={16} color={themeTone("#dc2626", "color")} />
                  <Text style={themeStyles.errorText}>{reviewError}</Text>
                </View>
              ) : null}

              <Pressable
                onPress={() => void handleSubmit()}
                disabled={reviewing}
                style={({ pressed }) => [themeStyles.submitBtn, pressed && themeStyles.submitPressed, reviewing && themeStyles.submitDisabled]}
              >
                {reviewing
                  ? <ActivityIndicator size="small" color={themeTone("#fff", "color")} />
                  : (<><Ionicons name="shield-checkmark" size={16} color={themeTone("#fff", "color")} /><Text style={themeStyles.submitLabel}>Submit Review</Text></>)
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
  container: { flex: 1, backgroundColor: "#F5FAF9" },
  headerRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#E0EDEB", backgroundColor: "#ffffff" },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#EDF5F4", alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#0E2A47" },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 40 },
  card: { backgroundColor: "#ffffff", borderRadius: 20, borderWidth: 1, borderColor: "#E0EDEB", padding: 16 },
  reviewedCard: { borderColor: "#a7f3d0", backgroundColor: "#f0fdf4" },
  reviewedHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  reviewedTitle: { fontSize: 15, fontWeight: "700", color: "#065f46" },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "#8BA3AB", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 14 },
  infoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  infoKey: { fontSize: 13, fontWeight: "600", color: "#64808C" },
  infoVal: { fontSize: 13, color: "#31515F", fontWeight: "500", flexShrink: 1, textAlign: "right", marginLeft: 8 },
  targetPill: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  targetPost: { backgroundColor: "#EAF8F5" },
  targetComment: { backgroundColor: "#cffafe" },
  targetLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.3 },
  targetPostLabel: { color: "#0E7C86" },
  targetCommentLabel: { color: "#0E7C86" },
  detailsBox: { backgroundColor: "#F5FAF9", borderRadius: 12, padding: 12, marginTop: 4 },
  detailsLabel: { fontSize: 11, fontWeight: "600", color: "#8BA3AB", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  detailsText: { fontSize: 14, color: "#31515F", lineHeight: 20 },
  postLoadingRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8 },
  postLoadingText: { fontSize: 13, color: "#8BA3AB" },
  postAuthorRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  postAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#EAF8F5", alignItems: "center", justifyContent: "center" },
  postAvatarText: { fontSize: 14, fontWeight: "700", color: "#0E7C86" },
  postAuthorName: { fontSize: 13, fontWeight: "700", color: "#0E2A47" },
  anonBadge: { fontSize: 11, color: "#8BA3AB", marginTop: 1 },
  postContentBox: { backgroundColor: "#F5FAF9", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#E0EDEB" },
  postContentText: { fontSize: 14, color: "#31515F", lineHeight: 22 },
  postUnavailable: { fontSize: 13, color: "#8BA3AB", fontStyle: "italic" },
  personRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#EAF8F5", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarGreen: { backgroundColor: "#d1fae5" },
  avatarLetter: { fontSize: 18, fontWeight: "700", color: "#0E7C86" },
  personName: { fontSize: 14, fontWeight: "700", color: "#0E2A47" },
  personEmail: { fontSize: 12, color: "#8BA3AB", marginTop: 2 },
  actionOption: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1.5, borderColor: "#E0EDEB", padding: 14, marginBottom: 10, backgroundColor: "#F5FAF9" },
  actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  actionTextWrap: { flex: 1 },
  actionLabel: { fontSize: 14, fontWeight: "700", color: "#0E2A47", marginBottom: 2 },
  actionDesc: { fontSize: 12, color: "#64808C", lineHeight: 16 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#C4D8DA", flexShrink: 0 },
  reasonInput: { borderWidth: 1.5, borderColor: "#E0EDEB", borderRadius: 14, padding: 12, fontSize: 14, color: "#0E2A47", minHeight: 100, backgroundColor: "#F5FAF9" },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fef2f2", borderRadius: 12, padding: 12, marginTop: 12 },
  errorText: { fontSize: 13, color: "#dc2626", flex: 1 },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#0E7C86", borderRadius: 16, paddingVertical: 15, marginTop: 20 },
  submitPressed: { opacity: 0.85 },
  submitDisabled: { opacity: 0.6 },
  submitLabel: { fontSize: 15, fontWeight: "700", color: "#ffffff" },
  charCounter: { fontSize: 11, color: "#8BA3AB", textAlign: "right", marginTop: 5 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14, color: "#8BA3AB" },
  errorIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#fff1f2", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  errorTitle: { fontSize: 17, fontWeight: "700", color: "#0E2A47", marginBottom: 6 },
  errorSub: { fontSize: 14, color: "#64808C", textAlign: "center", marginBottom: 20 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: "#0E7C86" },
  retryLabel: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  // Decision badge row inside Already Reviewed card
  actionDecisionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14 },
  actionDecisionBadge: { borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4 },
  actionDecisionLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.3 },
  // Moderator reason box
  reviewReasonBox: { backgroundColor: "#ffffff", borderRadius: 12, padding: 12, marginTop: 10, borderWidth: 1, borderColor: "#a7f3d0" },
  reviewReasonTitle: { fontSize: 11, fontWeight: "600", color: "#6ee7b7", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  reviewReasonText: { fontSize: 14, color: "#065f46", lineHeight: 20 },
});