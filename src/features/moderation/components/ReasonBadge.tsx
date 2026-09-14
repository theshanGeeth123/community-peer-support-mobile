import { StyleSheet, Text, View } from "react-native";

import type { ReportReason } from "../types/moderation.types";

interface ReasonBadgeProps {
  reason: ReportReason;
}

const config: Record<
  ReportReason,
  { label: string; bg: string; text: string }
> = {
  HARMFUL_CONTENT: {
    label: "Harmful Content",
    bg: "#fee2e2",
    text: "#991b1b",
  },
  HATE_SPEECH: {
    label: "Hate Speech",
    bg: "#ffe4e6",
    text: "#9f1239",
  },
  SPAM: {
    label: "Spam",
    bg: "#ffedd5",
    text: "#9a3412",
  },
  MISINFORMATION: {
    label: "Misinformation",
    bg: "#fef9c3",
    text: "#854d0e",
  },
  OTHER: {
    label: "Other",
    bg: "#f1f5f9",
    text: "#475569",
  },
};

export default function ReasonBadge({ reason }: ReasonBadgeProps) {
  const c = config[reason];

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.label, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
});
