import { useThemeTone, useThemedStyles } from '@/theme/useAlyvenAppearance';
﻿import { StyleSheet, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import type {
  ModerationAction,
  ModerationActionType,
} from "../types/moderation.types";

interface ModerationActionCardProps {
  action: ModerationAction;
}

const actionConfig: Record<
  ModerationActionType,
  { label: string; icon: React.ComponentProps<typeof Ionicons>["name"]; bg: string; color: string }
> = {
  NO_ACTION: {
    label: "No Action",
    icon: "checkmark-circle-outline",
    bg: "#f0fdf4",
    color: "#16a34a",
  },
  WARN: {
    label: "Warning Issued",
    icon: "warning-outline",
    bg: "#fffbeb",
    color: "#d97706",
  },
  REMOVE: {
    label: "Content Removed",
    icon: "trash-outline",
    bg: "#fff1f2",
    color: "#e11d48",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ModerationActionCard({
  action,
}: ModerationActionCardProps) {
  const themeStyles = useThemedStyles(styles);
  const themeTone = useThemeTone();

  const cfg = actionConfig[action.action];

  const targetType =
    typeof action.report === "string"
      ? action.targetType
      : action.report.targetType;

  const groupName =
    typeof action.group === "string"
      ? action.group
      : action.group.name;

  return (
    <View style={themeStyles.card}>
      {/* Header row */}
      <View style={themeStyles.header}>
        <View
          style={[themeStyles.iconWrap, { backgroundColor: cfg.bg }]}
        >
          <Ionicons
            name={cfg.icon}
            size={20}
            color={cfg.color}
          />
        </View>

        <View style={themeStyles.headerText}>
          <Text style={[themeStyles.actionLabel, { color: cfg.color }]}>
            {cfg.label}
          </Text>
          <Text style={themeStyles.meta}>
            {targetType} · {groupName}
          </Text>
        </View>

        <Text style={themeStyles.date}>
          {formatDate(action.createdAt)}
        </Text>
      </View>

      {/* Reason */}
      <View style={themeStyles.reasonWrap}>
        <Text style={themeStyles.reasonLabel}>Reason</Text>
        <Text style={themeStyles.reasonText}>{action.reason}</Text>
      </View>

      {/* Moderator */}
      <View style={themeStyles.footer}>
        <Ionicons
          name="shield-checkmark-outline"
          size={12}
          color={themeTone("#8BA3AB", "color")}
        />
        <Text style={themeStyles.footerText}>
          {action.moderator.fullName}
        </Text>
      </View>
    </View>
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
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerText: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  meta: {
    fontSize: 12,
    color: "#8BA3AB",
  },
  date: {
    fontSize: 11,
    color: "#8BA3AB",
    flexShrink: 0,
    marginTop: 2,
  },
  reasonWrap: {
    backgroundColor: "#F5FAF9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  reasonLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#8BA3AB",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 13,
    color: "#31515F",
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  footerText: {
    fontSize: 12,
    color: "#8BA3AB",
  },
});
