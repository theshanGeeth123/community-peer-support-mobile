import { useThemeTone, useThemedStyles } from '@/theme/useAlyvenAppearance';
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
  AiRiskLevel,
  CrisisFlag,
  Post,
  PostReactionType,
} from "@/features/groups/types/post.types";

import StaffBadge from "./StaffBadge";
import TranslatablePostText from "./TranslatablePostText";

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

const AI_RISK_LABELS: Record<AiRiskLevel, string> = {
  NONE: "No risk seen",
  LOW: "Low risk",
  HIGH: "High risk",
  URGENT: "Urgent risk",
};

/*
 * One line describing the AI safety check for staff, or null when
 * there is nothing to show (AI not configured, or it failed — the
 * keyword result still applies).
 */
function getAiReviewText(crisisFlag: CrisisFlag): string | null {
  if (crisisFlag.aiStatus === "PENDING") {
    return "AI review in progress…";
  }

  const ai = crisisFlag.ai;

  if (!ai) {
    return null;
  }

  const label = AI_RISK_LABELS[ai.riskLevel] ?? ai.riskLevel;

  /*
   * Keywords flagged it but the AI sees little risk: likely a false
   * alarm. The flag stays — staff make the final call.
   */
  const isLikelyFalseAlarm =
    ai.riskLevel === "NONE" || ai.riskLevel === "LOW";

  return [
    `AI review: ${label}`,
    isLikelyFalseAlarm ? "may be a false alarm" : null,
    ai.reason,
  ]
    .filter(Boolean)
    .join(" — ");
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
  highlighted = false,
  fromNotification = false,
}: {
  post: Post;

  currentUserId?: string;
  canModerate: boolean;

  /*
   * Briefly tinted, e.g. right after opening it from a notification.
   */
  highlighted?: boolean;

  /*
   * An older post shown at the top because a notification opened it.
   */
  fromNotification?: boolean;

  onToggleReaction: (
    reactionType: PostReactionType
  ) => void;
  onOpenComments: () => void;
  onDelete: () => void;
  onTogglePin?: () => void;
  onReport?: () => void;
  onMarkCrisisHandled?: () => void;
}) {
  const themeStyles = useThemedStyles(styles);
  const themeTone = useThemeTone();

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

  const aiReviewText = crisisFlag
    ? getAiReviewText(crisisFlag)
    : null;

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
        themeStyles.card,
        post.isPinned && themeStyles.cardPinned,
        hasOpenCrisisAlert && themeStyles.cardCrisis,
        highlighted && themeStyles.cardHighlighted,
      ]}
    >
      {/* OPENED FROM A NOTIFICATION */}

      {fromNotification && (
        <View style={themeStyles.notificationBadge}>
          <Ionicons
            name="notifications"
            size={12}
            color={themeTone("#0E7C86", "color")}
          />

          <Text style={themeStyles.notificationBadgeText}>
            From your notification
          </Text>
        </View>
      )}

      {/* CRISIS ALERT (staff only) */}

      {crisisFlag?.isFlagged && (
        <View
          style={[
            themeStyles.crisisBanner,
            crisisFlag.isHandled &&
              themeStyles.crisisBannerHandled,
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

          <View style={themeStyles.crisisBannerText}>
            <Text
              style={[
                themeStyles.crisisTitle,
                crisisFlag.isHandled &&
                  themeStyles.crisisTitleHandled,
              ]}
            >
              {crisisFlag.isHandled
                ? "Crisis alert handled"
                : crisisFlag.ai?.riskLevel === "URGENT"
                  ? "Urgent — please reach out now"
                  : "Possible crisis — please reach out"}
            </Text>

            {!crisisFlag.isHandled &&
              crisisFlag.matchedTerms.length > 0 && (
                <Text style={themeStyles.crisisTerms}>
                  Keywords: {crisisFlag.matchedTerms.join(", ")}
                </Text>
              )}

            {/* AI SAFETY CHECK */}

            {!crisisFlag.isHandled && aiReviewText && (
              <Text style={themeStyles.crisisTerms}>
                {aiReviewText}
              </Text>
            )}
          </View>

          {!crisisFlag.isHandled &&
            onMarkCrisisHandled && (
              <Pressable
                hitSlop={8}
                onPress={onMarkCrisisHandled}
                style={themeStyles.crisisHandleButton}
              >
                <Text
                  style={
                    themeStyles.crisisHandleButtonText
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
        <View style={themeStyles.pinnedBadge}>
          <Ionicons
            name="pin"
            size={12}
            color={themeTone("#b45309", "color")}
          />

          <Text style={themeStyles.pinnedBadgeText}>
            Pinned post
          </Text>
        </View>
      )}

      {/* HEADER */}

      <View style={themeStyles.header}>
        <View style={themeStyles.avatar}>
          {post.author.id === null ? (
            <Ionicons
              name="person"
              size={20}
              color={themeTone("#0E7C86", "color")}
            />
          ) : (
            <Text style={themeStyles.avatarText}>
              {getInitials(
                post.author.fullName
              )}
            </Text>
          )}
        </View>

        <View style={themeStyles.headerText}>
          <View style={themeStyles.authorRow}>
            <Text
              numberOfLines={1}
              style={themeStyles.authorName}
            >
              {post.author.fullName}
            </Text>

            <StaffBadge
              badge={post.author.staffBadge}
            />
          </View>

          <Text style={themeStyles.timestamp}>
            {post.groupName
              ? `${post.groupName} · ${formatRelativeTime(
                  post.createdAt
                )}`
              : formatRelativeTime(
                  post.createdAt
                )}
          </Text>
        </View>

        <View style={themeStyles.headerActions}>
          {canModerate && onTogglePin && (
            <Pressable
              hitSlop={10}
              onPress={onTogglePin}
              style={themeStyles.headerIconButton}
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
                    : "#8BA3AB"
                }
              />
            </Pressable>
          )}

          {canDelete && (
            <Pressable
              hitSlop={10}
              onPress={onDelete}
              style={themeStyles.headerIconButton}
            >
              <Ionicons
                name="trash-outline"
                size={19}
                color={themeTone("#8BA3AB", "color")}
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
                style={themeStyles.headerIconButton}
              >
                <Ionicons
                  name="flag-outline"
                  size={19}
                  color={themeTone("#8BA3AB", "color")}
                />
              </Pressable>
            )}
        </View>
      </View>

      {/* POST CONTENT */}

      {isContentHidden ? (
        <View style={themeStyles.warningCover}>
          <Ionicons
            name="eye-off-outline"
            size={22}
            color={themeTone("#b45309", "color")}
          />

          <Text style={themeStyles.warningCoverTitle}>
            Content warning
          </Text>

          <Text style={themeStyles.warningCoverLabels}>
            {formatContentWarnings(
              contentWarnings
            )}
          </Text>

          <Text style={themeStyles.warningCoverHint}>
            This post may be difficult to read. Take care
            of yourself — you can skip it.
          </Text>

          <Pressable
            onPress={() => setRevealed(true)}
            style={themeStyles.warningCoverButton}
          >
            <Text
              style={themeStyles.warningCoverButtonText}
            >
              Show post
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          {hasContentWarnings && (
            <View style={themeStyles.warningTagRow}>
              <View style={themeStyles.warningTag}>
                <Ionicons
                  name="warning-outline"
                  size={12}
                  color={themeTone("#b45309", "color")}
                />

                <Text style={themeStyles.warningTagText}>
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
                  <Text style={themeStyles.warningHideText}>
                    Hide
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          <TranslatablePostText
            post={post}
            style={themeStyles.content}
          />

          {post.imageUrl && (
            <Pressable
              onPress={() =>
                setImageViewerOpen(true)
              }
              accessibilityRole="imagebutton"
              accessibilityLabel="Open photo"
              style={themeStyles.postImageWrapper}
            >
              <Image
                source={{ uri: post.imageUrl }}
                style={themeStyles.postImage}
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
            style={themeStyles.viewerBackdrop}
            onPress={() =>
              setImageViewerOpen(false)
            }
          >
            <Image
              source={{ uri: post.imageUrl }}
              style={themeStyles.viewerImage}
              contentFit="contain"
            />

            <View style={themeStyles.viewerClose}>
              <Ionicons
                name="close"
                size={22}
                color={themeTone("#ffffff", "color")}
              />
            </View>
          </Pressable>
        </Modal>
      )}

      {/* POST ACTIONS */}

      <View style={themeStyles.footer}>
        {/* REACTION BUTTON + POPUP */}

        <View style={themeStyles.reactionContainer}>
          {reactionPickerOpen && (
            <View style={themeStyles.reactionPicker}>
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
                      themeStyles.reactionOption,
                      isSelected &&
                        themeStyles.reactionOptionSelected,
                    ]}
                  >
                    <Text
                      style={themeStyles.reactionEmoji}
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
              themeStyles.actionButton,
              currentReaction &&
                themeStyles.reactedActionButton,
            ]}
            onPress={handleReactionPress}
          >
            {currentReactionEmoji ? (
              <Text style={themeStyles.selectedReactionEmoji}>
                {currentReactionEmoji}
              </Text>
            ) : (
              <Ionicons
                name="heart-outline"
                size={19}
                color={themeTone("#64808C", "color")}
              />
            )}

            <Text
              style={[
                themeStyles.actionText,
                currentReaction &&
                  themeStyles.reactedActionText,
              ]}
            >
              {totalReactionCount}
            </Text>

            {currentReaction && (
              <Text
                style={themeStyles.reactionLabel}
              >
                {currentReactionLabel}
              </Text>
            )}
          </Pressable>
        </View>

        {/* COMMENTS */}

        <Pressable
          style={themeStyles.actionButton}
          onPress={onOpenComments}
        >
          <Ionicons
            name="chatbubble-outline"
            size={18}
            color={themeTone("#64808C", "color")}
          />

          <Text style={themeStyles.actionText}>
            {post.commentCount}
          </Text>

          <Text style={themeStyles.actionLabel}>
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
    borderColor: "#E0EDEB",
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

  cardHighlighted: {
    borderWidth: 2,
    borderColor: "#168994",
    backgroundColor: "#EAF8F5",
  },

  notificationBadge: {
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: "#D8F3EA",
  },

  notificationBadgeText: {
    marginLeft: 5,
    fontSize: 11,
    fontWeight: "800",
    color: "#0E7C86",
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
    backgroundColor: "#EAF8F5",
  },

  avatarText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0E7C86",
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
    color: "#0E2A47",
  },

  timestamp: {
    marginTop: 3,
    fontSize: 11,
    color: "#8BA3AB",
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
    color: "#31515F",
  },

  postImageWrapper: {
    marginTop: 12,
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: "#EDF5F4",
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
    color: "#8BA3AB",
  },

  footer: {
    marginTop: 15,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EDF5F4",
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
    borderColor: "#E0EDEB",
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
    backgroundColor: "#EDF5F4",
  },

  reactionEmoji: {
    fontSize: 23,
  },

  selectedReactionEmoji: {
    fontSize: 19,
  },

  reactedActionButton: {
    backgroundColor: "#F5FAF9",
  },

  reactedActionText: {
    color: "#0E7C86",
  },

  reactionLabel: {
    marginLeft: 4,
    fontSize: 12,
    color: "#64808C",
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
    color: "#64808C",
  },

  actionLabel: {
    marginLeft: 5,
    fontSize: 12,
    color: "#8BA3AB",
  },
});