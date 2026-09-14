import { StyleSheet, Text, View } from "react-native";

import type { ReportStatus } from "../types/moderation.types";

interface ReportStatusBadgeProps {
  status: ReportStatus;
}

const config: Record<
  ReportStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  PENDING: {
    label: "Pending",
    bg: "#fef3c7",
    text: "#92400e",
    dot: "#f59e0b",
  },
  REVIEWED: {
    label: "Reviewed",
    bg: "#d1fae5",
    text: "#065f46",
    dot: "#10b981",
  },
};

export default function ReportStatusBadge({
  status,
}: ReportStatusBadgeProps) {
  const c = config[status];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: c.bg },
      ]}
    >
      <View
        style={[styles.dot, { backgroundColor: c.dot }]}
      />
      <Text style={[styles.label, { color: c.text }]}>
        {c.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
});
