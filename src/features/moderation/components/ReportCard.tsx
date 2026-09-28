import { Pressable, StyleSheet, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import type { Report } from "../types/moderation.types";

import ReasonBadge from "./ReasonBadge";
import ReportStatusBadge from "./ReportStatusBadge";

interface ReportCardProps {
  report: Report;
  onPress: (report: Report) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ReportCard({
  report,
  onPress,
}: ReportCardProps) {
  const groupName =
    typeof report.group === "string"
      ? report.group
      : report.group.name;

  return (
    <Pressable
      onPress={() => onPress(report)}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      {/* Top row: target type pill + status badge */}
      <View style={styles.topRow}>
        <View
          style={[
            styles.targetPill,
            report.targetType === "POST"
              ? styles.targetPost
              : styles.targetComment,
          ]}
        >
          <Ionicons
            name={
              report.targetType === "POST"
                ? "document-text-outline"
                : "chatbubble-outline"
            }
            size={11}
            color={
              report.targetType === "POST"
                ? "#4f46e5"
                : "#0891b2"
            }
          />
          <Text
            style={[
              styles.targetLabel,
              report.targetType === "POST"
                ? styles.targetPostLabel
                : styles.targetCommentLabel,
            ]}
          >
            {report.targetType}
          </Text>
        </View>

        <ReportStatusBadge status={report.status} />
      </View>

      {/* Reason */}
      <View style={styles.reasonRow}>
        <ReasonBadge reason={report.reason} />
      </View>

      {/* Additional details preview */}
      {report.additionalDetails ? (
        <Text style={styles.details} numberOfLines={2}>
          {report.additionalDetails}
        </Text>
      ) : null}

      {/* Footer: reporter + group + date */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Ionicons
            name="person-outline"
            size={12}
            color="#94a3b8"
          />
          <Text style={styles.footerText}>
            {report.reporter.fullName}
          </Text>

          <Text style={styles.footerSep}>·</Text>

          <Ionicons
            name="people-outline"
            size={12}
            color="#94a3b8"
          />
          <Text style={styles.footerText} numberOfLines={1}>
            {groupName}
          </Text>
        </View>

        <Text style={styles.date}>
          {formatDate(report.createdAt)}
        </Text>
      </View>

      {/* Chevron */}
      <View style={styles.chevron}>
        <Ionicons
          name="chevron-forward"
          size={16}
          color="#cbd5e1"
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    marginBottom: 12,
    position: "relative",
  },
  cardPressed: {
    opacity: 0.82,
    backgroundColor: "#f8fafc",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  targetPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  targetPost: {
    backgroundColor: "#ede9fe",
  },
  targetComment: {
    backgroundColor: "#cffafe",
  },
  targetLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  targetPostLabel: {
    color: "#4f46e5",
  },
  targetCommentLabel: {
    color: "#0891b2",
  },
  reasonRow: {
    marginBottom: 8,
  },
  details: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    flexShrink: 1,
  },
  footerText: {
    fontSize: 12,
    color: "#94a3b8",
    flexShrink: 1,
  },
  footerSep: {
    fontSize: 12,
    color: "#cbd5e1",
  },
  date: {
    fontSize: 12,
    color: "#94a3b8",
    marginLeft: 8,
    flexShrink: 0,
  },
  chevron: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -8,
  },
});
