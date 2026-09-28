import { useState } from "react";

import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Image } from "expo-image";

import { Ionicons } from "@expo/vector-icons";

import { formatContentWarnings } from "@/features/groups/constants/contentWarnings";
import type {
  Post,
  PostReactionType,
} from "@/features/groups/types/post.types";

import StaffBadge from "./StaffBadge";

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

/*
 * Reaction configuration
 */
const POST_REACTIONS: {
  type: PostReactionType;
  emoji: string;
  label: string;
}[] = [
  {
    type: "like",
    emoji: "👍",
    label: "Like",
  },
  {
    type: "love",
    emoji: "❤️",
    label: "Love",
  },
  {
    type: "haha",
    emoji: "😂",
    label: "Haha",
  },
  {
    type: "wow",
    emoji: "😮",
    label: "Wow",
  },
  {
    type: "sad",
    emoji: "😢",
    label: "Sad",
  },
  {
    type: "angry",
    emoji: "😡",
    label: "Angry",
  },
];

function getReactionEmoji(
  reaction: PostReactionType | null
) {
  if (!reaction) {
    return null;
  }

  return (
    POST_REACTIONS.find(
      (item) => item.type === reaction
    )?.emoji ?? null
  );
}

function getReactionLabel(
  reaction: PostReactionType | null
) {
  if (!reaction) {
    return "";
  }

  return (
    POST_REACTIONS.find(
      (item) => item.type === reaction
    )?.label ?? ""
  );
}

export default function PostCard({
  post,
  currentUserId,
  canModerate,
  onToggleReaction,
  onOpenComments,
  onDelete,
  onTogglePin,
  onReport,
  onMarkCrisisHandled,
}: {
  post: Post;

  currentUserId?: string;
  canModerate: boolean;

  onToggleReaction: (
    reactionType: PostReactionType
  ) => void;
  onOpenComments: () => void;
  onDelete: () => void;
  onTogglePin?: () => void;
  onReport?: () => void;
  onMarkCrisisHandled?: () => void;
}) {
  const canDelete =
    canModerate ||
    (currentUserId &&
      post.author.id === currentUserId);

  /*
   * crisisFlag is only sent to group staff,
   * so members never see this banner.
   */
  const crisisFlag = post.crisisFlag;
  const hasOpenCrisisAlert =
    crisisFlag?.isFlagged === true && !crisisFlag.isHandled;

  /*
   * Posts with content warnings stay covered until the viewer
   * chooses to read them. Authors always see their own post.
   */
  const contentWarnings = post.contentWarnings ?? [];
  const hasContentWarnings = contentWarnings.length > 0;
  const isOwnPost =
    Boolean(currentUserId) && post.author.id === currentUserId;

  const [revealed, setRevealed] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);

  /*
   * Reaction picker state
   */
  const [reactionPickerOpen, setReactionPickerOpen] =
    useState(false);

  const isContentHidden =
    hasContentWarnings && !isOwnPost && !revealed;

  const currentReaction = post.myReaction ?? null;
  const currentReactionEmoji =
    getReactionEmoji(currentReaction);
  const currentReactionLabel =
    getReactionLabel(currentReaction);

  const totalReactionCount = Object.values(
    post.reactionCounts ?? {
      like: 0,
      love: 0,
      haha: 0,
      wow: 0,
      sad: 0,
      angry: 0,
    }
  ).reduce(
    (total, count) => total + count,
    0
  );

  const handleReactionPress = () => {
    setReactionPickerOpen((previous) => !previous);
  };

  const handleSelectReaction = (
    reactionType: PostReactionType
  ) => {
    setReactionPickerOpen(false);
    onToggleReaction(reactionType);
  };

  return (
    <View
      style={[
        styles.card,
        post.isPinned && styles.cardPinned,
        hasOpenCrisisAlert && styles.cardCrisis,
      ]}
    >
      {/* CRISIS ALERT (staff only) */}

      {crisisFlag?.isFlagged && (
        <View
          style={[
            styles.crisisBanner,
            crisisFlag.isHandled &&
              styles.crisisBannerHandled,
          ]}
        >
          <Ionicons
            name={
              crisisFlag.isHandled
                ? "checkmark-circle"
                : "warning"
            }
            size={16}
            color={
              crisisFlag.isHandled
                ? "#15803d"
                : "#be123c"
            }
          />

          <View style={styles.crisisBannerText}>
            <Text
              style={[
                styles.crisisTitle,
                crisisFlag.isHandled &&
                  styles.crisisTitleHandled,
              ]}
            >
              {crisisFlag.isHandled
                ? "Crisis alert handled"
                : "Possible crisis — please reach out"}
            </Text>

            {!crisisFlag.isHandled &&
              crisisFlag.matchedTerms.length > 0 && (
                <Text style={styles.crisisTerms}>
                  Detected:{" "}
                  {crisisFlag.matchedTerms.join(", ")}
                </Text>
              )}
          </View>

          {!crisisFlag.isHandled &&
            onMarkCrisisHandled && (
              <Pressable
                hitSlop={8}
                onPress={onMarkCrisisHandled}
                style={styles.crisisHandleButton}
              >
                <Text
                  style={
                    styles.crisisHandleButtonText
                  }
                >
                  Mark handled
                </Text>
              </Pressable>
            )}
        </View>
      )}

      {/* PINNED BADGE */}

      {post.isPinned && (
        <View style={styles.pinnedBadge}>
          <Ionicons
            name="pin"
            size={12}
            color="#b45309"
          />

          <Text style={styles.pinnedBadgeText}>
            Pinned post
          </Text>
        </View>
      )}

      {/* HEADER */}

      <View style={styles.header}>
        <View style={styles.avatar}>
          {post.author.id === null ? (
            <Ionicons
              name="person"
              size={20}
              color="#4f46e5"
            />
          ) : (
            <Text style={styles.avatarText}>
              {getInitials(
                post.author.fullName
              )}
            </Text>
          )}
        </View>

        <View style={styles.headerText}>
          <View style={styles.authorRow}>
            <Text
              numberOfLines={1}
              style={styles.authorName}
            >
              {post.author.fullName}
            </Text>

            <StaffBadge
              badge={post.author.staffBadge}
            />
          </View>

          <Text style={styles.timestamp}>
            {post.groupName
              ? `${post.groupName} · ${formatRelativeTime(
                  post.createdAt
                )}`
              : formatRelativeTime(
                  post.createdAt
                )}
          </Text>
        </View>

        <View style={styles.headerActions}>
          {canModerate && onTogglePin && (
            <Pressable
              hitSlop={10}
              onPress={onTogglePin}
              style={styles.headerIconButton}
            >
              <Ionicons
                name={
                  post.isPinned
                    ? "pin"
                    : "pin-outline"
                }
                size={19}
                color={
                  post.isPinned
                    ? "#b45309"
                    : "#94a3b8"
                }
              />
            </Pressable>
          )}

          {canDelete && (
            <Pressable
              hitSlop={10}
              onPress={onDelete}
              style={styles.headerIconButton}
            >
              <Ionicons
                name="trash-outline"
                size={19}
                color="#94a3b8"
              />
            </Pressable>
          )}

          {/* Report button — shown to non-moderators for others' posts */}
          {!canModerate &&
            onReport &&
            post.author.id !== currentUserId && (
              <Pressable
                hitSlop={12}
                onPress={onReport}
                style={styles.headerIconButton}
              >
                <Ionicons
                  name="flag-outline"
                  size={19}
                  color="#94a3b8"
                />
              </Pressable>
            )}
        </View>
      </View>

      {/* POST CONTENT */}

      {isContentHidden ? (
        <View style={styles.warningCover}>
          <Ionicons
            name="eye-off-outline"
            size={22}
            color="#b45309"
          />

          <Text style={styles.warningCoverTitle}>
            Content warning
          </Text>

          <Text style={styles.warningCoverLabels}>
            {formatContentWarnings(
              contentWarnings
            )}
          </Text>

          <Text style={styles.warningCoverHint}>
            This post may be difficult to read. Take care
            of yourself — you can skip it.
          </Text>

          <Pressable
            onPress={() => setRevealed(true)}
            style={styles.warningCoverButton}
          >
            <Text
              style={styles.warningCoverButtonText}
            >
              Show post
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          {hasContentWarnings && (
            <View style={styles.warningTagRow}>
              <View style={styles.warningTag}>
                <Ionicons
                  name="warning-outline"
                  size={12}
                  color="#b45309"
                />

                <Text style={styles.warningTagText}>
                  {formatContentWarnings(
                    contentWarnings
                  )}
                </Text>
              </View>

              {revealed && (
                <Pressable
                  hitSlop={8}
                  onPress={() =>
                    setRevealed(false)
                  }
                >
                  <Text style={styles.warningHideText}>
                    Hide
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          <Text style={styles.content}>
            {post.content}
          </Text>

          {post.imageUrl && (
            <Pressable
              onPress={() =>
                setImageViewerOpen(true)
              }
              accessibilityRole="imagebutton"
              accessibilityLabel="Open photo"
              style={styles.postImageWrapper}
            >
              <Image
                source={{ uri: post.imageUrl }}
                style={styles.postImage}
                contentFit="cover"
                transition={150}
              />
            </Pressable>
          )}
        </>
      )}

      {/* FULL-SCREEN PHOTO */}

      {post.imageUrl && (
        <Modal
          visible={imageViewerOpen}
          transparent
          animationType="fade"
          onRequestClose={() =>
            setImageViewerOpen(false)
          }
        >
          <Pressable
            style={styles.viewerBackdrop}
            onPress={() =>
              setImageViewerOpen(false)
            }
          >
            <Image
              source={{ uri: post.imageUrl }}
              style={styles.viewerImage}
              contentFit="contain"
            />

            <View style={styles.viewerClose}>
              <Ionicons
                name="close"
                size={22}
                color="#ffffff"
              />
            </View>
          </Pressable>
        </Modal>
      )}

      {/* POST ACTIONS */}

      <View style={styles.footer}>
        {/* REACTION BUTTON + POPUP */}

        <View style={styles.reactionContainer}>
          {reactionPickerOpen && (
            <View style={styles.reactionPicker}>
              {POST_REACTIONS.map((reaction) => {
                const isSelected =
                  currentReaction === reaction.type;

                return (
                  <Pressable
                    key={reaction.type}
                    onPress={() =>
                      handleSelectReaction(
                        reaction.type
                      )
                    }
                    accessibilityRole="button"
                    accessibilityLabel={
                      reaction.label
                    }
                    style={[
                      styles.reactionOption,
                      isSelected &&
                        styles.reactionOptionSelected,
                    ]}
                  >
                    <Text
                      style={styles.reactionEmoji}
                    >
                      {reaction.emoji}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          <Pressable
            style={[
              styles.actionButton,
              currentReaction &&
                styles.reactedActionButton,
            ]}
            onPress={handleReactionPress}
          >
            {currentReactionEmoji ? (
              <Text style={styles.selectedReactionEmoji}>
                {currentReactionEmoji}
              </Text>
            ) : (
              <Ionicons
                name="heart-outline"
                size={19}
                color="#64748b"
              />
            )}

            <Text
              style={[
                styles.actionText,
                currentReaction &&
                  styles.reactedActionText,
              ]}
            >
              {totalReactionCount}
            </Text>

            {currentReaction && (
              <Text
                style={styles.reactionLabel}
              >
                {currentReactionLabel}
              </Text>
            )}
          </Pressable>
        </View>

        {/* COMMENTS */}

        <Pressable
          style={styles.actionButton}
          onPress={onOpenComments}
        >
          <Ionicons
            name="chatbubble-outline"
            size={18}
            color="#64748b"
          />

          <Text style={styles.actionText}>
            {post.commentCount}
          </Text>

          <Text style={styles.actionLabel}>
            Comments
          </Text>
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
    borderRadius: 20,
    backgroundColor: "#ffffff",
  },

  cardPinned: {
    borderColor: "#fbbf24",
    backgroundColor: "#fffbeb",
  },

  cardCrisis: {
    borderColor: "#fda4af",
  },

  crisisBanner: {
    marginBottom: 12,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "#fff1f2",
  },

  crisisBannerHandled: {
    backgroundColor: "#f0fdf4",
  },

  crisisBannerText: {
    flex: 1,
    marginLeft: 8,
  },

  crisisTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#be123c",
  },

  crisisTitleHandled: {
    color: "#15803d",
  },

  crisisTerms: {
    marginTop: 2,
    fontSize: 11,
    color: "#9f1239",
  },

  crisisHandleButton: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#be123c",
  },

  crisisHandleButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ffffff",
  },

  pinnedBadge: {
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: "#fef3c7",
  },

  pinnedBadgeText: {
    marginLeft: 5,
    fontSize: 11,
    fontWeight: "800",
    color: "#b45309",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: "#eef2ff",
  },

  avatarText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#4f46e5",
  },

  headerText: {
    flex: 1,
    marginLeft: 10,
  },

  authorRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  authorName: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },

  timestamp: {
    marginTop: 3,
    fontSize: 11,
    color: "#94a3b8",
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerIconButton: {
    marginLeft: 12,
  },

  content: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 21,
    color: "#334155",
  },

  postImageWrapper: {
    marginTop: 12,
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
  },

  postImage: {
    width: "100%",
    aspectRatio: 4 / 3,
  },

  viewerBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(2, 6, 23, 0.94)",
  },

  viewerImage: {
    width: "100%",
    height: "80%",
  },

  viewerClose: {
    position: "absolute",
    top: 54,
    right: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },

  warningCover: {
    marginTop: 14,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 16,
    backgroundColor: "#fffbeb",
  },

  warningCoverTitle: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "800",
    color: "#92400e",
  },

  warningCoverLabels: {
    marginTop: 3,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
    color: "#b45309",
  },

  warningCoverHint: {
    marginTop: 8,
    maxWidth: 260,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 17,
    color: "#a16207",
  },

  warningCoverButton: {
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#d97706",
  },

  warningCoverButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },

  warningTagRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  warningTag: {
    flexShrink: 1,
    paddingHorizontal: 9,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: "#fef3c7",
  },

  warningTagText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: "700",
    color: "#b45309",
  },

  warningHideText: {
    marginLeft: 10,
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
  },

  footer: {
    marginTop: 15,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },

  /*
   * Reaction area
   */
  reactionContainer: {
    position: "relative",
    marginRight: 12,
  },

  reactionPicker: {
    position: "absolute",
    bottom: 46,
    left: -4,
    zIndex: 100,
    paddingHorizontal: 7,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 18,
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },

  reactionOption: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },

  reactionOptionSelected: {
    backgroundColor: "#f1f5f9",
  },

  reactionEmoji: {
    fontSize: 23,
  },

  selectedReactionEmoji: {
    fontSize: 19,
  },

  reactedActionButton: {
    backgroundColor: "#f8fafc",
  },

  reactedActionText: {
    color: "#4f46e5",
  },

  reactionLabel: {
    marginLeft: 4,
    fontSize: 12,
    color: "#64748b",
  },

  actionButton: {
    marginRight: 24,
    paddingVertical: 5,
    paddingHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
  },

  actionText: {
    marginLeft: 5,
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
  },

  actionLabel: {
    marginLeft: 5,
    fontSize: 12,
    color: "#94a3b8",
  },
});