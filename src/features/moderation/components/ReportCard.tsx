import { useThemeTone, useThemedStyles } from '@/theme/useAlyvenAppearance';
﻿import { Pressable, StyleSheet, Text, View } from "react-native";

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
  const themeStyles = useThemedStyles(styles);
  const themeTone = useThemeTone();

  const groupName =
    typeof report.group === "string"
      ? report.group
      : report.group.name;

  return (
    <Pressable
      onPress={() => onPress(report)}
      style={({ pressed }) => [
        themeStyles.card,
        pressed && themeStyles.cardPressed,
      ]}
    >
      {/* Top row: target type pill + status badge */}
      <View style={themeStyles.topRow}>
        <View
          style={[
            themeStyles.targetPill,
            report.targetType === "POST"
              ? themeStyles.targetPost
              : themeStyles.targetComment,
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
                ? "#0E7C86"
                : "#0E7C86"
            }
          />
          <Text
            style={[
              themeStyles.targetLabel,
              report.targetType === "POST"
                ? themeStyles.targetPostLabel
                : themeStyles.targetCommentLabel,
            ]}
          >
            {report.targetType}
          </Text>
        </View>

        <ReportStatusBadge status={report.status} />
      </View>

      {/* Reason */}
      <View style={themeStyles.reasonRow}>
        <ReasonBadge reason={report.reason} />
      </View>

      {/* Additional details preview */}
      {report.additionalDetails ? (
        <Text style={themeStyles.details} numberOfLines={2}>
          {report.additionalDetails}
        </Text>
      ) : null}

      {/* Footer: reporter + group + date */}
      <View style={themeStyles.footer}>
        <View style={themeStyles.footerLeft}>
          <Ionicons
            name="person-outline"
            size={12}
            color={themeTone("#8BA3AB", "color")}
          />
          <Text style={themeStyles.footerText}>
            {report.reporter.fullName}
          </Text>

          <Text style={themeStyles.footerSep}>·</Text>

          <Ionicons
            name="people-outline"
            size={12}
            color={themeTone("#8BA3AB", "color")}
          />
          <Text style={themeStyles.footerText} numberOfLines={1}>
            {groupName}
          </Text>
        </View>

        <Text style={themeStyles.date}>
          {formatDate(report.createdAt)}
        </Text>
      </View>

      {/* Chevron */}
      <View style={themeStyles.chevron}>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={themeTone("#C4D8DA", "color")}
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
    borderColor: "#E0EDEB",
    padding: 16,
    marginBottom: 12,
    position: "relative",
  },
  cardPressed: {
    opacity: 0.82,
    backgroundColor: "#F5FAF9",
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
    backgroundColor: "#EAF8F5",
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
    color: "#0E7C86",
  },
  targetCommentLabel: {
    color: "#0E7C86",
  },
  reasonRow: {
    marginBottom: 8,
  },
  details: {
    fontSize: 13,
    color: "#64808C",
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
    color: "#8BA3AB",
    flexShrink: 1,
  },
  footerSep: {
    fontSize: 12,
    color: "#C4D8DA",
  },
  date: {
    fontSize: 12,
    color: "#8BA3AB",
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
