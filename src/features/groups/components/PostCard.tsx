import { Pressable, StyleSheet, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import type { Post } from "@/features/groups/types/post.types";

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

export default function PostCard({
  post,
  currentUserId,
  canModerate,
  onToggleLike,
  onOpenComments,
  onDelete,
  onTogglePin,
}: {
  post: Post;

  currentUserId?: string;
  canModerate: boolean;

  onToggleLike: () => void;
  onOpenComments: () => void;
  onDelete: () => void;
  onTogglePin?: () => void;
}) {
  const canDelete =
    canModerate || (currentUserId && post.author.id === currentUserId);

  return (
    <View style={[styles.card, post.isPinned && styles.cardPinned]}>
      {post.isPinned && (
        <View style={styles.pinnedBadge}>
          <Ionicons name="pin" size={12} color="#b45309" />
          <Text style={styles.pinnedBadgeText}>Pinned</Text>
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.avatar}>
          {post.author.id === null ? (
            <Ionicons name="person" size={20} color="#4f46e5" />
          ) : (
            <Text style={styles.avatarText}>
              {getInitials(post.author.fullName)}
            </Text>
          )}
        </View>

        <View style={styles.headerText}>
          <Text style={styles.authorName}>{post.author.fullName}</Text>

          <Text style={styles.timestamp}>
            {post.groupName
              ? `${post.groupName} · ${formatRelativeTime(post.createdAt)}`
              : formatRelativeTime(post.createdAt)}
          </Text>
        </View>

        {canModerate && onTogglePin && (
          <Pressable hitSlop={10} onPress={onTogglePin} style={{ marginRight: 14 }}>
            <Ionicons
              name={post.isPinned ? "pin" : "pin-outline"}
              size={19}
              color={post.isPinned ? "#b45309" : "#94a3b8"}
            />
          </Pressable>
        )}

        {canDelete && (
          <Pressable hitSlop={10} onPress={onDelete}>
            <Ionicons name="trash-outline" size={19} color="#94a3b8" />
          </Pressable>
        )}
      </View>

      <Text style={styles.content}>{post.content}</Text>

      <View style={styles.footer}>
        <Pressable style={styles.actionButton} onPress={onToggleLike}>
          <Ionicons
            name={post.likedByMe ? "heart" : "heart-outline"}
            size={19}
            color={post.likedByMe ? "#ef4444" : "#64748b"}
          />

          <Text style={styles.actionText}>{post.likeCount}</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={onOpenComments}>
          <Ionicons name="chatbubble-outline" size={18} color="#64748b" />

          <Text style={styles.actionText}>{post.commentCount}</Text>
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
    borderColor: "#e2e8f0",
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
    backgroundColor: "#eef2ff",
  },

  avatarText: {
    fontWeight: "800",
    color: "#4f46e5",
  },

  headerText: {
    flex: 1,
    marginLeft: 10,
  },

  authorName: {
    fontWeight: "700",
    color: "#0f172a",
  },

  timestamp: {
    marginTop: 2,
    fontSize: 11,
    color: "#94a3b8",
  },

  content: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 21,
    color: "#334155",
  },

  footer: {
    marginTop: 12,
    paddingTop: 12,
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
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
    color: "#64748b",
  },
});
