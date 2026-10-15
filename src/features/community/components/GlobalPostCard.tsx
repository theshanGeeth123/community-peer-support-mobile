import { useThemeTone, useThemedStyles } from '@/theme/useAlyvenAppearance';
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import type { GlobalPost } from "@/features/community/types/globalPost.types";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatRelativeTime(isoDate: string) {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return new Date(isoDate).toLocaleDateString();
}

export default function GlobalPostCard({
  post,
  currentUserId,
  canModerate,
  onToggleLike,
  onOpenComments,
  onDelete,
}: {
  post: GlobalPost;

  currentUserId?: string;
  canModerate: boolean;

  onToggleLike: () => void;
  onOpenComments: () => void;
  onDelete: () => void;
}) {
  const themeStyles = useThemedStyles(styles);
  const themeTone = useThemeTone();

  const canDelete =
    canModerate || (currentUserId && post.author.id === currentUserId);

  return (
    <View style={[themeStyles.card, post.isPinned && themeStyles.cardPinned]}>
      {post.isPinned && (
        <View style={themeStyles.pinnedBadge}>
          <Ionicons name="pin" size={12} color={themeTone("#b45309", "color")} />
          <Text style={themeStyles.pinnedBadgeText}>
            {post.postType === "announcement" ? "Announcement" : "Pinned"}
          </Text>
        </View>
      )}

      <View style={themeStyles.header}>
        <View style={themeStyles.avatar}>
          <Text style={themeStyles.avatarText}>
            {getInitials(post.author.fullName)}
          </Text>
        </View>

        <View style={themeStyles.headerText}>
          <Text style={themeStyles.authorName}>{post.author.fullName}</Text>

          <Text style={themeStyles.timestamp}>
            {post.author.role} · {formatRelativeTime(post.createdAt)}
          </Text>
        </View>

        {canDelete && (
          <Pressable hitSlop={10} onPress={onDelete}>
            <Ionicons name="trash-outline" size={19} color={themeTone("#8BA3AB", "color")} />
          </Pressable>
        )}
      </View>

      <Text style={themeStyles.content}>{post.content}</Text>

      <View style={themeStyles.footer}>
        <Pressable style={themeStyles.actionButton} onPress={onToggleLike}>
          <Ionicons
            name={post.likedByMe ? "heart" : "heart-outline"}
            size={19}
            color={post.likedByMe ? "#ef4444" : "#64808C"}
          />

          <Text style={themeStyles.actionText}>{post.likeCount}</Text>
        </Pressable>

        <Pressable style={themeStyles.actionButton} onPress={onOpenComments}>
          <Ionicons name="chatbubble-outline" size={18} color={themeTone("#64808C", "color")} />

          <Text style={themeStyles.actionText}>{post.commentCount}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0EDEB",
    borderRadius: 18,
    backgroundColor: "#ffffff",
  },

  cardPinned: {
    borderColor: "#fbbf24",
    backgroundColor: "#fffbeb",
  },

  pinnedBadge: {
    marginBottom: 10,
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#fef3c7",
  },

  pinnedBadgeText: {
    marginLeft: 5,
    fontSize: 11,
    fontWeight: "700",
    color: "#b45309",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#EAF8F5",
  },

  avatarText: {
    fontWeight: "800",
    color: "#0E7C86",
  },

  headerText: {
    flex: 1,
    marginLeft: 10,
  },

  authorName: {
    fontWeight: "700",
    color: "#0E2A47",
  },

  timestamp: {
    marginTop: 2,
    fontSize: 11,
    color: "#8BA3AB",
  },

  content: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 21,
    color: "#31515F",
  },

  footer: {
    marginTop: 12,
    paddingTop: 12,
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#EDF5F4",
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },

  actionText: {
    marginLeft: 5,
    fontSize: 13,
    fontWeight: "600",
    color: "#64808C",
  },
});
