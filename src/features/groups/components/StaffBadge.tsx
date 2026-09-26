import { StyleSheet, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import type { StaffBadge as StaffBadgeType } from "../types/post.types";

const BADGE_CONFIG: Record<
  StaffBadgeType,
  {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    background: string;
    color: string;
  }
> = {
  PEER_SUPPORTER: {
    label: "Peer Supporter",
    icon: "heart",
    background: "#dcfce7",
    color: "#15803d",
  },
  MODERATOR: {
    label: "Moderator",
    icon: "shield-checkmark",
    background: "#e0e7ff",
    color: "#4338ca",
  },
  ADMIN: {
    label: "Admin",
    icon: "star",
    background: "#f3e8ff",
    color: "#7e22ce",
  },
};

/*
 * Small label shown next to a staff member's name so members know
 * the reply comes from a trained supporter. Reusable for comments.
 */
export default function StaffBadge({
  badge,
}: {
  badge?: StaffBadgeType | null;
}) {
  if (!badge) {
    return null;
  }

  const config = BADGE_CONFIG[badge];

  if (!config) {
    return null;
  }

  return (
    <View style={[styles.badge, { backgroundColor: config.background }]}>
      <Ionicons name={config.icon} size={10} color={config.color} />

      <Text style={[styles.label, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    marginLeft: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
  },

  label: {
    marginLeft: 3,
    fontSize: 10,
    fontWeight: "800",
  },
});
