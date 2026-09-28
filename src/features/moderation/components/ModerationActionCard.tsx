import { StyleSheet, Text, View } from "react-native";

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
    <View style={styles.card}>
      {/* Header row */}
      <View style={styles.header}>
        <View
          style={[styles.iconWrap, { backgroundColor: cfg.bg }]}
        >
          <Ionicons
            name={cfg.icon}
            size={20}
            color={cfg.color}
          />
        </View>

        <View style={styles.headerText}>
          <Text style={[styles.actionLabel, { color: cfg.color }]}>
            {cfg.label}
          </Text>
          <Text style={styles.meta}>
            {targetType} · {groupName}
          </Text>
        </View>

        <Text style={styles.date}>
          {formatDate(action.createdAt)}
        </Text>
      </View>

      {/* Reason */}
      <View style={styles.reasonWrap}>
        <Text style={styles.reasonLabel}>Reason</Text>
        <Text style={styles.reasonText}>{action.reason}</Text>
      </View>

      {/* Moderator */}
      <View style={styles.footer}>
        <Ionicons
          name="shield-checkmark-outline"
          size={12}
          color="#94a3b8"
        />
        <Text style={styles.footerText}>
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
    borderColor: "#e2e8f0",
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
    color: "#94a3b8",
  },
  date: {
    fontSize: 11,
    color: "#94a3b8",
    flexShrink: 0,
    marginTop: 2,
  },
  reasonWrap: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  reasonLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  footerText: {
    fontSize: 12,
    color: "#94a3b8",
  },
});
