import { useThemeTone, useThemedStyles } from '@/theme/useAlyvenAppearance';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import type {
  AiReview,
  AiReviewVerdict,
  ModerationActionType,
} from "../types/moderation.types";

// ─── Config maps ──────────────────────────────────────────────────────────────

const verdictConfig: Record<
  AiReviewVerdict,
  { label: string; icon: React.ComponentProps<typeof Ionicons>["name"]; color: string; bg: string; border: string }
> = {
  NO_VIOLATION: {
    label: "No Violation Detected",
    icon: "checkmark-circle-outline",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
  },
  POSSIBLE_VIOLATION: {
    label: "Possible Violation",
    icon: "warning-outline",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  CLEAR_VIOLATION: {
    label: "Clear Violation",
    icon: "alert-circle-outline",
    color: "#e11d48",
    bg: "#fff1f2",
    border: "#fecdd3",
  },
};

const actionConfig: Record<
  ModerationActionType,
  { label: string; color: string; bg: string }
> = {
  NO_ACTION: { label: "No Action", color: "#16a34a", bg: "#f0fdf4" },
  WARN:      { label: "Warn",      color: "#d97706", bg: "#fffbeb" },
  REMOVE:    { label: "Remove",    color: "#e11d48", bg: "#fff1f2" },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface AiReviewCardProps {
  /** Null until generated. */
  aiReview: AiReview | null;
  loading: boolean;
  error: string | null;
  /** Called when the user taps "Generate AI Review" or "Retry". */
  onGenerate: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AiReviewCard({
  aiReview,
  loading,
  error,
  onGenerate,
}: AiReviewCardProps) {
  const themeStyles = useThemedStyles(styles);
  const themeTone = useThemeTone();

  const vCfg = aiReview ? verdictConfig[aiReview.verdict] : null;
  const aCfg = aiReview ? actionConfig[aiReview.suggestedAction] : null;

  return (
    <View style={themeStyles.card}>
      {/* Header */}
      <View style={themeStyles.headerRow}>
        <View style={themeStyles.headerLeft}>
          <View style={themeStyles.aiIconWrap}>
            <Ionicons name="sparkles" size={16} color={themeTone("#0E7C86", "color")} />
          </View>
          <Text style={themeStyles.headerTitle}>AI Review</Text>
        </View>
        <Text style={themeStyles.advisoryBadge}>Advisory only</Text>
      </View>

      {/* Not yet generated */}
      {!aiReview && !loading && !error && (
        <View style={themeStyles.promptBox}>
          <Text style={themeStyles.promptText}>
            Let AI scan this report and suggest a moderation action.
          </Text>
          <Pressable
            onPress={onGenerate}
            style={({ pressed }) => [themeStyles.generateBtn, pressed && themeStyles.generateBtnPressed]}
          >
            <Ionicons name="sparkles" size={14} color={themeTone("#ffffff", "color")} />
            <Text style={themeStyles.generateBtnLabel}>Generate AI Review</Text>
          </Pressable>
        </View>
      )}

      {/* Loading */}
      {loading && (
        <View style={themeStyles.loadingRow}>
          <ActivityIndicator size="small" color={themeTone("#0E7C86", "color")} />
          <Text style={themeStyles.loadingText}>Analysing report…</Text>
        </View>
      )}

      {/* Error */}
      {error && !loading && (
        <View style={themeStyles.errorBox}>
          <Ionicons name="alert-circle-outline" size={15} color={themeTone("#dc2626", "color")} />
          <Text style={themeStyles.errorText} numberOfLines={3}>{error}</Text>
          <Pressable onPress={onGenerate} style={themeStyles.retryBtn}>
            <Text style={themeStyles.retryLabel}>Retry</Text>
          </Pressable>
        </View>
      )}

      {/* Result */}
      {aiReview && vCfg && aCfg && (
        <>
          {/* Verdict banner */}
          <View style={[themeStyles.verdictBanner, { backgroundColor: vCfg.bg, borderColor: vCfg.border }]}>
            <Ionicons name={vCfg.icon} size={18} color={vCfg.color} />
            <Text style={[themeStyles.verdictLabel, { color: vCfg.color }]}>{vCfg.label}</Text>
          </View>

          {/* Summary */}
          <View style={themeStyles.summaryBox}>
            <Text style={themeStyles.summaryLabel}>Summary</Text>
            <Text style={themeStyles.summaryText}>{aiReview.summary}</Text>
          </View>

          {/* Concerned parts */}
          {aiReview.concernedParts ? (
            <View style={themeStyles.concernBox}>
              <Text style={themeStyles.concernLabel}>Concerning Content</Text>
              <Text style={themeStyles.concernText}>{aiReview.concernedParts}</Text>
            </View>
          ) : null}

          {/* Suggested action */}
          <View style={themeStyles.suggestionRow}>
            <Text style={themeStyles.suggestionKey}>Suggested Action</Text>
            <View style={[themeStyles.suggestionBadge, { backgroundColor: aCfg.bg }]}>
              <Text style={[themeStyles.suggestionBadgeLabel, { color: aCfg.color }]}>{aCfg.label}</Text>
            </View>
          </View>

          {/* Regenerate */}
          <Pressable
            onPress={onGenerate}
            style={({ pressed }) => [themeStyles.regenBtn, pressed && themeStyles.generateBtnPressed]}
          >
            <Ionicons name="refresh-outline" size={13} color={themeTone("#0E7C86", "color")} />
            <Text style={themeStyles.regenLabel}>Regenerate</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0EDEB",
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  aiIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#EAF8F5",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0E2A47",
    letterSpacing: 0.1,
  },
  advisoryBadge: {
    fontSize: 10,
    fontWeight: "600",
    color: "#8BA3AB",
    backgroundColor: "#EDF5F4",
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 3,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  // Not-yet-generated state
  promptBox: {
    backgroundColor: "#faf5ff",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 12,
  },
  promptText: {
    fontSize: 13,
    color: "#64808C",
    textAlign: "center",
    lineHeight: 18,
  },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0E7C86",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  generateBtnPressed: {
    opacity: 0.82,
  },
  generateBtnLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  // Loading
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  loadingText: {
    fontSize: 13,
    color: "#8BA3AB",
  },
  // Error
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: "#dc2626",
    lineHeight: 17,
  },
  retryBtn: {
    borderRadius: 8,
    backgroundColor: "#fecaca",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  retryLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#b91c1c",
  },
  // Verdict
  verdictBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
  },
  verdictLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  // Summary
  summaryBox: {
    backgroundColor: "#F5FAF9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#8BA3AB",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 5,
  },
  summaryText: {
    fontSize: 13,
    color: "#31515F",
    lineHeight: 19,
  },
  // Concerned parts
  concernBox: {
    backgroundColor: "#fffbeb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fde68a",
    padding: 12,
    marginBottom: 10,
  },
  concernLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#92400e",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 5,
  },
  concernText: {
    fontSize: 13,
    color: "#78350f",
    lineHeight: 18,
  },
  // Suggested action
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  suggestionKey: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64808C",
  },
  suggestionBadge: {
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  suggestionBadgeLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  // Regenerate button
  regenBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd6fe",
    paddingVertical: 7,
  },
  regenLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0E7C86",
  },
});
