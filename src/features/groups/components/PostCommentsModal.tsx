import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { commentApi } from "@/features/groups/api/comment.api";
import type {
  Comment,
} from "@/features/groups/types/comment.types";

import type {
  CommentMediaFile,
} from "@/features/groups/api/comment.api";

import { getApiErrorMessage } from "@/services/api/apiError";

type CommentReactionType =
  | "like"
  | "love"
  | "haha"
  | "wow"
  | "sad"
  | "angry";

type CommentMediaItem = {
  type: "image" | "video";
  url: string;
  publicId?: string;
};

const COMMENT_REACTIONS: {
  type: CommentReactionType;
  emoji: string;
}[] = [
  { type: "like", emoji: "👍" },
  { type: "love", emoji: "❤️" },
  { type: "haha", emoji: "😂" },
  { type: "wow", emoji: "😮" },
  { type: "sad", emoji: "😢" },
  { type: "angry", emoji: "😡" },
];

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
    return `${diffMinutes}m`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays}d`;
  }

  return new Date(isoDate).toLocaleDateString();
}

function getReactionEmoji(
  reaction: CommentReactionType | null
) {
  if (!reaction) {
    return null;
  }

  return (
    COMMENT_REACTIONS.find(
      (item) => item.type === reaction
    )?.emoji ?? null
  );
}

export default function PostCommentsModal({
  postId,
  visible,
  currentUserId,
  canModerate,
  onClose,
}: {
  postId: string | null;
  visible: boolean;

  currentUserId?: string;
  canModerate: boolean;

  onClose: () => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | COMMENT SEARCH / SORTING
  |--------------------------------------------------------------------------
  */

  const [commentSearch, setCommentSearch] = useState("");
  const [commentSort, setCommentSort] = useState<
    "newest" | "oldest" | "mostLiked"
  >("newest");
  const [showSortOptions, setShowSortOptions] = useState(false);

  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  const [editingComment, setEditingComment] =
    useState<Comment | null>(null);

  const [editText, setEditText] = useState("");

  /*
  |--------------------------------------------------------------------------
  | COMMENT / REPLY MEDIA
  |--------------------------------------------------------------------------
  |
  | Stores photos/videos selected by the user before submitting.
  |
  */

  const [selectedMedia, setSelectedMedia] = useState<
    CommentMediaFile[]
  >([]);

  /*
  |--------------------------------------------------------------------------
  | COMMENT / REPLY REACTION STATE
  |--------------------------------------------------------------------------
  */

  const [reactionState, setReactionState] = useState<
    Record<
      string,
      {
        reaction: CommentReactionType | null;
        count: number;
      }
    >
  >({});

  /*
  |--------------------------------------------------------------------------
  | OPEN REACTION PICKER
  |--------------------------------------------------------------------------
  */

  const [openReactionCommentId, setOpenReactionCommentId] =
    useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | LOAD COMMENTS
  |--------------------------------------------------------------------------
  */

  const loadComments = useCallback(async () => {
    if (!postId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetchComments(postId);

      setComments(response);

      const initialReactionState: Record<
        string,
        {
          reaction: CommentReactionType | null;
          count: number;
        }
      > = {};

      response.forEach((comment) => {
        const reactionCounts = (
          comment as Comment & {
            reactionCounts?: Partial<
              Record<CommentReactionType, number>
            >;
          }
        ).reactionCounts;

        const myReaction = (
          comment as Comment & {
            myReaction?: CommentReactionType | null;
          }
        ).myReaction;

        const totalReactionCount = reactionCounts
          ? Object.values(reactionCounts).reduce(
              (total, value) => total + (value ?? 0),
              0
            )
          : comment.heartCount ?? 0;

        initialReactionState[comment.id] = {
          reaction:
            myReaction ??
            (comment.heartedByMe ? "love" : null),
          count: totalReactionCount,
        };
      });

      setReactionState(initialReactionState);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (visible) {
      void loadComments();
    }
  }, [visible, loadComments]);

  /*
  |--------------------------------------------------------------------------
  | GET COMMENTS
  |--------------------------------------------------------------------------
  */

  const fetchComments = async (
    targetPostId: string
  ): Promise<Comment[]> => {
    const { postApi } = await import(
      "@/features/groups/api/post.api"
    );

    const response = await postApi.listComments(targetPostId);

    return (response.data.comments ?? []) as Comment[];
  };

  /*
  |--------------------------------------------------------------------------
  | TOP LEVEL COMMENTS
  |--------------------------------------------------------------------------
  */

  const getReplies = (commentId: string) => {
    return comments.filter(
      (comment) => comment.parentComment === commentId
    );
  };

  /*
  |--------------------------------------------------------------------------
  | COMMENT SEARCH / SORTING
  |--------------------------------------------------------------------------
  */

  const getCommentReactionCount = (comment: Comment) => {
    const reactionStateItem =
      reactionState[comment.id];

    if (reactionStateItem) {
      return reactionStateItem.count;
    }

    const reactionCounts = (
      comment as Comment & {
        reactionCounts?: Partial<
          Record<CommentReactionType, number>
        >;
      }
    ).reactionCounts;

    if (reactionCounts) {
      return Object.values(reactionCounts).reduce(
        (total, value) => total + (value ?? 0),
        0
      );
    }

    return comment.heartCount ?? 0;
  };

  const normalizedSearch = commentSearch
    .trim()
    .toLowerCase();

  const filteredRootComments = useMemo(() => {
    const roots = comments.filter(
      (comment) => !comment.parentComment
    );

    const filtered = roots.filter((comment) => {
      if (!normalizedSearch) {
        return true;
      }

      const commentMatches =
        comment.content
          .toLowerCase()
          .includes(normalizedSearch);

      if (commentMatches) {
        return true;
      }

      return getReplies(comment.id).some((reply) =>
        reply.content
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });

    return [...filtered].sort((a, b) => {
      if (commentSort === "oldest") {
        return (
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
        );
      }

      if (commentSort === "mostLiked") {
        return (
          getCommentReactionCount(b) -
          getCommentReactionCount(a)
        );
      }

      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      );
    });
  }, [
    comments,
    commentSearch,
    commentSort,
    reactionState,
  ]);

  const getVisibleReplies = (
    comment: Comment
  ) => {
    const replies = getReplies(comment.id);

    if (!normalizedSearch) {
      return replies;
    }

    const commentMatches =
      comment.content
        .toLowerCase()
        .includes(normalizedSearch);

    if (commentMatches) {
      return replies;
    }

    return replies.filter((reply) =>
      reply.content
        .toLowerCase()
        .includes(normalizedSearch)
    );
  };

  /*
  |--------------------------------------------------------------------------
  | SELECT PHOTO / VIDEO
  |--------------------------------------------------------------------------
  */

  const handleSelectMedia = async () => {
    try {
      setError(null);

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please allow photo and video access to attach media."
        );

        return;
      }

      const result =
  await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images", "videos"],

    allowsMultipleSelection: true,

    selectionLimit: 5,

    quality: 0.8,
  });

      if (result.canceled) {
        return;
      }

      /*
      |--------------------------------------------------------------
      | Convert Expo assets to React Native FormData files.
      |--------------------------------------------------------------
      */

      const mediaFiles: CommentMediaFile[] =
        result.assets.map((asset, index) => {
          const isVideo =
            asset.type === "video";

          let mimeType =
            asset.mimeType;

          if (!mimeType) {
            mimeType = isVideo
              ? "video/mp4"
              : "image/jpeg";
          }

          let fileName =
            asset.fileName;

          if (!fileName) {
            const extension = isVideo
              ? "mp4"
              : "jpg";

            fileName =
              `comment-media-${Date.now()}-${index}.${extension}`;
          }

          return {
            uri: asset.uri,
            name: fileName,
            type: mimeType,
          };
        });

      setSelectedMedia(mediaFiles);
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError)
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | REMOVE SELECTED MEDIA
  |--------------------------------------------------------------------------
  */

  const handleRemoveMedia = (
    index: number
  ) => {
    setSelectedMedia((previous) =>
      previous.filter(
        (_, mediaIndex) =>
          mediaIndex !== index
      )
    );
  };

  /*
  |--------------------------------------------------------------------------
  | PREFETCH SAVED COMMENT / REPLY MEDIA
  |--------------------------------------------------------------------------
  */

  const prefetchSavedMedia = async (comment: Comment) => {
    const media =
      (
        comment as Comment & {
          media?: CommentMediaItem[];
        }
      ).media ?? [];

    const imageUrls = media
      .filter((item) => item.type === "image" && item.url)
      .map((item) => item.url);

    if (imageUrls.length === 0) {
      return;
    }

    await Promise.all(
      imageUrls.map(async (url) => {
        try {
          await Image.prefetch(url);
        } catch {
          // Keep the existing comment/reply flow even if prefetch fails.
        }
      })
    );
  };

  /*
  |--------------------------------------------------------------------------
  | ADD COMMENT
  |--------------------------------------------------------------------------
  */

  const handleAddComment = async () => {
    if (
      !postId ||
      newComment.trim().length === 0
    ) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response =
        await commentApi.createComment(
          postId,
          {
            content: newComment.trim(),
          },
          selectedMedia
        );

      await prefetchSavedMedia(
        response.data.comment
      );

      setComments((previous) => [
        ...previous,
        response.data.comment,
      ]);

      setNewComment("");

      setSelectedMedia([]);
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError)
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | ADD REPLY
  |--------------------------------------------------------------------------
  */

  const handleAddReply = async () => {
    if (
      !replyingTo ||
      newComment.trim().length === 0
    ) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response =
        await commentApi.createReply(
          replyingTo.id,
          {
            content: newComment.trim(),
          },
          selectedMedia
        );

      await prefetchSavedMedia(
        response.data.reply
      );

      setComments((previous) => [
        ...previous,
        response.data.reply,
      ]);

      setNewComment("");
      setSelectedMedia([]);
      setReplyingTo(null);
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError)
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE COMMENT
  |--------------------------------------------------------------------------
  */

  const handleDeleteComment = async (
    commentId: string
  ) => {
    try {
      setError(null);

      await commentApi.deleteComment(
        commentId
      );

      setComments((previous) =>
        previous.filter(
          (comment) =>
            comment.id !== commentId &&
            comment.parentComment !== commentId
        )
      );

      setReactionState((previous) => {
        const next = { ...previous };

        delete next[commentId];

        return next;
      });

      if (
        openReactionCommentId ===
        commentId
      ) {
        setOpenReactionCommentId(null);
      }
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError)
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CONFIRM DELETE
  |--------------------------------------------------------------------------
  */

  const confirmDelete = (
    comment: Comment
  ) => {
    Alert.alert(
      "Delete comment",
      "Are you sure you want to delete this comment?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            void handleDeleteComment(
              comment.id
            ),
        },
      ]
    );
  };

  /*
  |--------------------------------------------------------------------------
  | START EDIT
  |--------------------------------------------------------------------------
  */

  const startEdit = (
    comment: Comment
  ) => {
    setEditingComment(comment);
    setEditText(comment.content);
    setError(null);
    setOpenReactionCommentId(null);
  };

  /*
  |--------------------------------------------------------------------------
  | UPDATE COMMENT
  |--------------------------------------------------------------------------
  */

  const handleUpdateComment =
    async () => {
      if (
        !editingComment ||
        editText.trim().length === 0
      ) {
        return;
      }

      try {
        setSubmitting(true);
        setError(null);

        const response =
          await commentApi.updateComment(
            editingComment.id,
            {
              content:
                editText.trim(),
            }
          );

        setComments((previous) =>
          previous.map((comment) =>
            comment.id ===
            editingComment.id
              ? response.data.comment
              : comment
          )
        );

        setEditingComment(null);
        setEditText("");
      } catch (requestError) {
        setError(
          getApiErrorMessage(
            requestError
          )
        );
      } finally {
        setSubmitting(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | COMMENT / REPLY REACTION
  |--------------------------------------------------------------------------
  */

  const handleSelectReaction =
    async (
      comment: Comment,
      reactionType: CommentReactionType
    ) => {
      try {
        setError(null);
        setOpenReactionCommentId(null);

        const response =
          await commentApi.toggleReaction(
            comment.id,
            reactionType
          );

        const responseData =
          response.data;

        const reactionCounts =
          responseData.reactionCounts ??
          {};

        const totalReactionCount =
          Object.values(
            reactionCounts
          ).reduce(
            (total, value) =>
              total + (value ?? 0),
            0
          );

        setReactionState(
          (previous) => ({
            ...previous,
            [comment.id]: {
              reaction:
                responseData.reaction ??
                null,
              count:
                totalReactionCount,
            },
          })
        );
      } catch (requestError) {
        setError(
          getApiErrorMessage(
            requestError
          )
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | TOGGLE COMMENT / REPLY PIN
  |--------------------------------------------------------------------------
  */

  const handleToggleCommentPin = async (
    comment: Comment
  ) => {
    try {
      setError(null);

      const response =
        await commentApi.toggleCommentPin(
          comment.id
        );

      const isPinned =
        response.data.isPinned;

      setComments((previous) =>
        previous.map((item) =>
          item.id === comment.id
            ? {
                ...item,
                isPinned,
              }
            : item
        )
      );
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError)
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | OPEN REPLY
  |--------------------------------------------------------------------------
  */

  const startReply = (
    comment: Comment
  ) => {
    setReplyingTo(comment);
    setEditingComment(null);
    setNewComment("");
    setSelectedMedia([]);
    setOpenReactionCommentId(null);
  };

  /*
  |--------------------------------------------------------------------------
  | CANCEL INPUT MODE
  |--------------------------------------------------------------------------
  */

  const cancelInputMode = () => {
    setReplyingTo(null);
    setEditingComment(null);
    setNewComment("");
    setEditText("");
    setSelectedMedia([]);
  };

  /*
  |--------------------------------------------------------------------------
  | MEDIA PREVIEW
  |--------------------------------------------------------------------------
  */

  const renderMediaPreview = () => {
    if (selectedMedia.length === 0) {
      return null;
    }

    return (
      <View style={styles.mediaPreviewContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.mediaPreviewContent
          }
        >
          {selectedMedia.map(
            (media, index) => {
              const isVideo =
                media.type?.startsWith(
                  "video/"
                ) ?? false;

              return (
                <View
                  key={`${media.uri}-${index}`}
                  style={styles.mediaPreviewItem}
                >
                  {isVideo ? (
                    <View
                      style={
                        styles.videoPreview
                      }
                    >
                      <Ionicons
                        name="play-circle"
                        size={34}
                        color="#ffffff"
                      />

                      <Text
                        style={
                          styles.videoLabel
                        }
                      >
                        Video
                      </Text>
                    </View>
                  ) : (
                    <Image
                      source={{
                        uri: media.uri,
                      }}
                      style={
                        styles.mediaPreviewImage
                      }
                    />
                  )}

                  <Pressable
                    onPress={() =>
                      handleRemoveMedia(
                        index
                      )
                    }
                    style={
                      styles.removeMediaButton
                    }
                  >
                    <Ionicons
                      name="close"
                      size={15}
                      color="#ffffff"
                    />
                  </Pressable>
                </View>
              );
            }
          )}
        </ScrollView>

        <Text style={styles.mediaCountText}>
          {selectedMedia.length}{" "}
          {selectedMedia.length === 1
            ? "item"
            : "items"}{" "}
          selected
        </Text>
      </View>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | SAVED COMMENT / REPLY MEDIA
  |--------------------------------------------------------------------------
  */

  const renderSavedMedia = (comment: Comment) => {
    const media =
      (
        comment as Comment & {
          media?: CommentMediaItem[];
        }
      ).media ?? [];

    if (media.length === 0) {
      return null;
    }

    return (
      <View style={styles.savedMediaContainer}>
        {media.map((item, index) => {
          const isVideo = item.type === "video";

          return (
            <View
              key={`${item.url}-${index}`}
              style={styles.savedMediaItem}
            >
              {isVideo ? (
                <View style={styles.savedVideoContainer}>
                  <Ionicons
                    name="play-circle"
                    size={42}
                    color="#ffffff"
                  />

                  <Text style={styles.savedVideoLabel}>
                    Video
                  </Text>
                </View>
              ) : (
                <Image
                  source={{ uri: item.url }}
                  style={styles.savedMediaImage}
                  resizeMode="cover"
                />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | COMMENT ITEM
  |--------------------------------------------------------------------------
  */

  const renderComment = (
    comment: Comment,
    isReply = false
  ) => {
    const canModify =
      canModerate ||
      comment.author.id ===
        currentUserId;

    const isCommentAuthor =
      comment.author.id ===
      currentUserId;

    const isPinned =
      (comment as Comment & {
        isPinned?: boolean;
      }).isPinned ?? false;

    const currentReaction =
      reactionState[
        comment.id
      ] ?? {
        reaction:
          (
            comment as Comment & {
              myReaction?: CommentReactionType | null;
            }
          ).myReaction ??
          (comment.heartedByMe
            ? "love"
            : null),
        count:
          comment.heartCount ?? 0,
      };

    const reactionEmoji =
      getReactionEmoji(
        currentReaction.reaction
      );

    const replies = isReply
      ? []
      : getVisibleReplies(comment);

    const isReactionPickerOpen =
      openReactionCommentId ===
      comment.id;

    return (
      <View
        key={comment.id}
        style={[
          styles.commentBlock,
          isReply &&
            styles.replyBlock,
        ]}
      >
        <View style={styles.commentRow}>
          <View style={styles.avatar}>
            <Text
              style={
                styles.avatarText
              }
            >
              {getInitials(
                comment.author.fullName
              )}
            </Text>
          </View>

          <View
            style={styles.commentMain}
          >
            <View
              style={
                styles.commentBubble
              }
            >
              <View
                style={
                  styles.commentTopRow
                }
              >
                <Text
                  style={
                    styles.authorName
                  }
                >
                  {
                    comment.author
                      .fullName
                  }
                </Text>

                <Text
                  style={
                    styles.timeText
                  }
                >
                  {formatRelativeTime(
                    comment.createdAt
                  )}
                </Text>
              </View>

              {editingComment?.id ===
              comment.id ? (
                <View
                  style={
                    styles.editContainer
                  }
                >
                  <TextInput
                    value={editText}
                    onChangeText={
                      setEditText
                    }
                    multiline
                    autoFocus
                    style={
                      styles.editInput
                    }
                    placeholder="Edit your comment..."
                    placeholderTextColor="#94a3b8"
                  />

                  <View
                    style={
                      styles.editActions
                    }
                  >
                    <Pressable
                      onPress={
                        cancelInputMode
                      }
                      style={
                        styles.cancelButton
                      }
                    >
                      <Text
                        style={
                          styles.cancelText
                        }
                      >
                        Cancel
                      </Text>
                    </Pressable>

                    <Pressable
                      disabled={
                        submitting ||
                        editText
                          .trim()
                          .length ===
                          0
                      }
                      onPress={() =>
                        void handleUpdateComment()
                      }
                      style={[
                        styles.saveButton,
                        (submitting ||
                          editText
                            .trim()
                            .length ===
                            0) &&
                          styles.disabledButton,
                      ]}
                    >
                      {submitting ? (
                        <ActivityIndicator
                          size="small"
                          color="#ffffff"
                        />
                      ) : (
                        <Text
                          style={
                            styles.saveText
                          }
                        >
                          Save
                        </Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              ) : (
                <>
                  <Text
                    style={
                      styles.commentContent
                    }
                  >
                    {comment.content}
                  </Text>

                  {renderSavedMedia(comment)}
                </>
              )}
            </View>

            {editingComment?.id !==
              comment.id && (
              <>
                {isReactionPickerOpen && (
                  <View
                    style={
                      styles.reactionPicker
                    }
                  >
                    {COMMENT_REACTIONS.map(
                      (reaction) => {
                        const selected =
                          currentReaction.reaction ===
                          reaction.type;

                        return (
                          <Pressable
                            key={
                              reaction.type
                            }
                            onPress={() =>
                              void handleSelectReaction(
                                comment,
                                reaction.type
                              )
                            }
                            style={[
                              styles.reactionOption,
                              selected &&
                                styles.reactionOptionSelected,
                            ]}
                          >
                            <Text
                              style={
                                styles.reactionEmoji
                              }
                            >
                              {
                                reaction.emoji
                              }
                            </Text>
                          </Pressable>
                        );
                      }
                    )}
                  </View>
                )}

                <View
                  style={
                    styles.commentActions
                  }
                >
                  <Pressable
                    onPress={() => {
                      setOpenReactionCommentId(
                        isReactionPickerOpen
                          ? null
                          : comment.id
                      );
                    }}
                    style={[
                      styles.smallAction,
                      currentReaction.reaction &&
                        styles.reactedAction,
                    ]}
                  >
                    <Text
                      style={
                        styles.selectedReactionEmoji
                      }
                    >
                      {reactionEmoji ??
                        "♡"}
                    </Text>

                    <Text
                      style={[
                        styles.smallActionText,
                        currentReaction.reaction &&
                          styles.reactionCountText,
                      ]}
                    >
                      {
                        currentReaction.count
                      }
                    </Text>
                  </Pressable>

                  {!isReply && (
                    <Pressable
                      onPress={() =>
                        startReply(
                          comment
                        )
                      }
                      style={
                        styles.smallAction
                      }
                    >
                      <Ionicons
                        name="return-down-forward-outline"
                        size={16}
                        color="#64748b"
                      />

                      <Text
                        style={
                          styles.smallActionText
                        }
                      >
                        Reply
                      </Text>
                    </Pressable>
                  )}

                  {isCommentAuthor && (
                    <Pressable
                      onPress={() =>
                        void handleToggleCommentPin(
                          comment
                        )
                      }
                      style={[
                        styles.smallAction,
                        isPinned &&
                          styles.pinnedAction,
                      ]}
                    >
                      <Ionicons
                        name={
                          isPinned
                            ? "pin"
                            : "pin-outline"
                        }
                        size={15}
                        color={
                          isPinned
                            ? "#4f46e5"
                            : "#64748b"
                        }
                      />

                      <Text
                        style={[
                          styles.smallActionText,
                          isPinned &&
                            styles.pinnedActionText,
                        ]}
                      >
                        {isPinned
                          ? "Unpin"
                          : "Pin"}
                      </Text>
                    </Pressable>
                  )}

                  {canModify && (
                    <Pressable
                      onPress={() =>
                        startEdit(
                          comment
                        )
                      }
                      style={
                        styles.smallAction
                      }
                    >
                      <Ionicons
                        name="create-outline"
                        size={16}
                        color="#64748b"
                      />

                      <Text
                        style={
                          styles.smallActionText
                        }
                      >
                        Edit
                      </Text>
                    </Pressable>
                  )}

                  {canModify && (
                    <Pressable
                      onPress={() =>
                        confirmDelete(
                          comment
                        )
                      }
                      style={
                        styles.smallAction
                      }
                    >
                      <Ionicons
                        name="trash-outline"
                        size={15}
                        color="#ef4444"
                      />

                      <Text
                        style={
                          styles.deleteText
                        }
                      >
                        Delete
                      </Text>
                    </Pressable>
                  )}
                </View>
              </>
            )}
          </View>
        </View>

        {!isReply &&
          replies.length > 0 && (
            <View
              style={
                styles.repliesContainer
              }
            >
              {replies.map(
                (reply) =>
                  renderComment(
                    reply,
                    true
                  )
              )}
            </View>
          )}
      </View>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <View
          style={styles.overlay}
        >
          <Pressable
            style={styles.backdrop}
            onPress={onClose}
          />

          <View
            style={styles.container}
          >
            <View
              style={styles.header}
            >
              <View>
                <Text
                  style={styles.title}
                >
                  Comments
                </Text>

                {!loading && (
                  <Text
                    style={
                      styles.commentCount
                    }
                  >
                    {comments.length}{" "}
                    {comments.length ===
                    1
                      ? "comment"
                      : "comments"}
                  </Text>
                )}
              </View>

              <Pressable
                hitSlop={10}
                onPress={onClose}
                style={
                  styles.closeButton
                }
              >
                <Ionicons
                  name="close"
                  size={22}
                  color="#334155"
                />
              </Pressable>
            </View>

            <View style={styles.searchSortContainer}>
              <View style={styles.searchContainer}>
                <Ionicons
                  name="search-outline"
                  size={18}
                  color="#94a3b8"
                />

                <TextInput
                  value={commentSearch}
                  onChangeText={setCommentSearch}
                  placeholder="Search comments..."
                  placeholderTextColor="#94a3b8"
                  style={styles.searchInput}
                  returnKeyType="search"
                  autoCorrect={false}
                />

                {commentSearch.length > 0 && (
                  <Pressable
                    onPress={() => setCommentSearch("")}
                    hitSlop={8}
                  >
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color="#94a3b8"
                    />
                  </Pressable>
                )}
              </View>

              <View style={styles.sortContainer}>
                <Pressable
                  onPress={() =>
                    setShowSortOptions(
                      (previous) => !previous
                    )
                  }
                  style={styles.sortButton}
                >
                  <Ionicons
                    name="swap-vertical-outline"
                    size={17}
                    color="#4f46e5"
                  />

                  <Text style={styles.sortButtonText}>
                    {commentSort === "newest"
                      ? "Newest"
                      : commentSort === "oldest"
                        ? "Oldest"
                        : "Most Liked"}
                  </Text>

                  <Ionicons
                    name={
                      showSortOptions
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    size={15}
                    color="#64748b"
                  />
                </Pressable>

                {showSortOptions && (
                  <View style={styles.sortOptions}>
                    {[
                      {
                        value: "newest" as const,
                        label: "Newest",
                      },
                      {
                        value: "oldest" as const,
                        label: "Oldest",
                      },
                      {
                        value: "mostLiked" as const,
                        label: "Most Liked",
                      },
                    ].map((option) => (
                      <Pressable
                        key={option.value}
                        onPress={() => {
                          setCommentSort(
                            option.value
                          );
                          setShowSortOptions(false);
                        }}
                        style={[
                          styles.sortOption,
                          commentSort ===
                            option.value &&
                            styles.sortOptionSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.sortOptionText,
                            commentSort ===
                              option.value &&
                              styles.sortOptionSelectedText,
                          ]}
                        >
                          {option.label}
                        </Text>

                        {commentSort ===
                          option.value && (
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color="#4f46e5"
                          />
                        )}
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <ScrollView
              style={styles.list}
              contentContainerStyle={
                styles.listContent
              }
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={
                false
              }
            >
              {loading ? (
                <View
                  style={
                    styles.loadingContainer
                  }
                >
                  <ActivityIndicator
                    size="large"
                    color="#4f46e5"
                  />

                  <Text
                    style={
                      styles.loadingText
                    }
                  >
                    Loading comments...
                  </Text>
                </View>
              ) : filteredRootComments.length ===
                0 ? (
                <View
                  style={
                    styles.emptyContainer
                  }
                >
                  <View
                    style={
                      styles.emptyIcon
                    }
                  >
                    <Ionicons
                      name={
                        normalizedSearch
                          ? "search-outline"
                          : "chatbubble-ellipses-outline"
                      }
                      size={32}
                      color="#6366f1"
                    />
                  </View>

                  <Text
                    style={
                      styles.emptyTitle
                    }
                  >
                    {normalizedSearch
                      ? "No matching comments"
                      : "No comments yet"}
                  </Text>

                  <Text
                    style={
                      styles.emptyText
                    }
                  >
                    {normalizedSearch
                      ? "Try a different search term."
                      : "Start the conversation and support your community."}
                  </Text>
                </View>
              ) : (
                filteredRootComments.map(
                  (comment) =>
                    renderComment(
                      comment
                    )
                )
              )}

              {error && (
                <View
                  style={
                    styles.errorContainer
                  }
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={18}
                    color="#b91c1c"
                  />

                  <Text
                    style={
                      styles.errorText
                    }
                  >
                    {error}
                  </Text>
                </View>
              )}
            </ScrollView>

            {replyingTo && (
              <View
                style={
                  styles.replyingBanner
                }
              >
                <View
                  style={
                    styles.replyingInfo
                  }
                >
                  <Ionicons
                    name="return-down-forward-outline"
                    size={17}
                    color="#4f46e5"
                  />

                  <Text
                    style={
                      styles.replyingText
                    }
                    numberOfLines={1}
                  >
                    Replying to{" "}
                    <Text
                      style={
                        styles.replyingName
                      }
                    >
                      {
                        replyingTo
                          .author
                          .fullName
                      }
                    </Text>
                  </Text>
                </View>

                <Pressable
                  onPress={
                    cancelInputMode
                  }
                  hitSlop={10}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color="#94a3b8"
                  />
                </Pressable>
              </View>
            )}

            {renderMediaPreview()}

            <View
              style={
                styles.inputContainer
              }
            >
              <View
                style={
                  styles.inputAvatar
                }
              >
                <Ionicons
                  name="person"
                  size={18}
                  color="#4f46e5"
                />
              </View>

              <TextInput
                value={newComment}
                onChangeText={
                  setNewComment
                }
                editable={!submitting}
                placeholder={
                  replyingTo
                    ? "Write a reply..."
                    : "Write a comment..."
                }
                placeholderTextColor="#94a3b8"
                style={styles.input}
                multiline
                maxLength={1000}
              />

              <Pressable
                disabled={submitting}
                onPress={() =>
                  void handleSelectMedia()
                }
                style={[
                  styles.mediaButton,
                  submitting &&
                    styles.disabledMediaButton,
                ]}
              >
                <Ionicons
                  name="image-outline"
                  size={21}
                  color="#4f46e5"
                />
              </Pressable>

              <Pressable
                disabled={
                  submitting ||
                  newComment
                    .trim()
                    .length === 0
                }
                onPress={() =>
                  void (replyingTo
                    ? handleAddReply()
                    : handleAddComment())
                }
                style={[
                  styles.sendButton,
                  (submitting ||
                    newComment
                      .trim()
                      .length ===
                      0) &&
                    styles.disabledSendButton,
                ]}
              >
                {submitting ? (
                  <ActivityIndicator
                    size="small"
                    color="#ffffff"
                  />
                ) : (
                  <Ionicons
                    name="arrow-up"
                    size={20}
                    color="#ffffff"
                  />
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/*
|--------------------------------------------------------------------------
| STYLES
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor:
      "rgba(15, 23, 42, 0.48)",
  },

  backdrop: {
    flex: 1,
  },

  container: {
    height: "82%",
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },

  header: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#eef2f7",
  },

  title: {
    fontSize: 21,
    fontWeight: "800",
    color: "#0f172a",
  },

  commentCount: {
    marginTop: 2,
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },

  searchSortContainer: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eef2f7",
    backgroundColor: "#ffffff",
    zIndex: 20,
  },

  searchContainer: {
    flex: 1,
    minHeight: 40,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    backgroundColor: "#f8fafc",
  },

  searchInput: {
    flex: 1,
    marginLeft: 7,
    paddingVertical: 8,
    color: "#0f172a",
    fontSize: 13,
  },

  sortContainer: {
    position: "relative",
    marginLeft: 8,
    zIndex: 30,
  },

  sortButton: {
    minHeight: 40,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },

  sortButtonText: {
    marginHorizontal: 5,
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },

  sortOptions: {
    position: "absolute",
    top: 45,
    right: 0,
    width: 145,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    shadowColor: "#0f172a",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 50,
  },

  sortOption: {
    minHeight: 38,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sortOptionSelected: {
    backgroundColor: "#eef2ff",
  },

  sortOptionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },

  sortOptionSelectedText: {
    color: "#4f46e5",
    fontWeight: "700",
  },

  closeButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: "#f8fafc",
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
  },

  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: "#94a3b8",
  },

  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 35,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 34,
    backgroundColor: "#eef2ff",
  },

  emptyTitle: {
    marginTop: 15,
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
  },

  emptyText: {
    marginTop: 7,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    color: "#94a3b8",
  },

  commentBlock: {
    marginBottom: 18,
  },

  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  replyBlock: {
    marginBottom: 12,
  },

  avatar: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: "#eef2ff",
  },

  avatarText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4f46e5",
  },

  commentMain: {
    flex: 1,
    marginLeft: 10,
  },

  commentBubble: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 17,
    backgroundColor: "#f8fafc",
  },

  commentTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  authorName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },

  timeText: {
    marginLeft: 8,
    fontSize: 10,
    color: "#94a3b8",
  },

  commentContent: {
    marginTop: 5,
    fontSize: 14,
    lineHeight: 20,
    color: "#334155",
  },

  savedMediaContainer: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
  },

  savedMediaItem: {
    width: 150,
    height: 150,
    marginRight: 8,
    marginBottom: 8,
    overflow: "hidden",
    borderRadius: 12,
    backgroundColor: "#e2e8f0",
  },

  savedMediaImage: {
    width: "100%",
    height: "100%",
  },

  savedVideoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#334155",
  },

  savedVideoLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },

  reactionPicker: {
    alignSelf: "flex-start",
    marginTop: 7,
    marginLeft: 2,
    paddingHorizontal: 7,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 999,
    backgroundColor: "#ffffff",
    shadowColor: "#0f172a",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 7,
    elevation: 4,
  },

  reactionOption: {
    width: 34,
    height: 34,
    marginHorizontal: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
  },

  reactionOptionSelected: {
    backgroundColor: "#eef2ff",
  },

  reactionEmoji: {
    fontSize: 21,
  },

  commentActions: {
    marginTop: 7,
    paddingLeft: 4,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  smallAction: {
    marginRight: 16,
    marginBottom: 3,
    flexDirection: "row",
    alignItems: "center",
  },

  reactedAction: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#f8fafc",
  },

  pinnedAction: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#eef2ff",
  },

  pinnedActionText: {
    color: "#4f46e5",
  },

  selectedReactionEmoji: {
    fontSize: 17,
    minWidth: 17,
    textAlign: "center",
  },

  smallActionText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
  },

  reactionCountText: {
    color: "#4f46e5",
  },

  deleteText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: "700",
    color: "#ef4444",
  },

  repliesContainer: {
    marginLeft: 48,
    marginTop: 10,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#e2e8f0",
  },

  editContainer: {
    marginTop: 8,
  },

  editInput: {
    minHeight: 65,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#c7d2fe",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    color: "#0f172a",
    fontSize: 13,
  },

  editActions: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  cancelButton: {
    marginRight: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  cancelText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },

  saveButton: {
    minWidth: 55,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#4f46e5",
  },

  saveText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },

  disabledButton: {
    opacity: 0.5,
  },

  errorContainer: {
    marginTop: 15,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#fef2f2",
  },

  errorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: "#b91c1c",
  },

  replyingBanner: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    borderTopWidth: 1,
    borderTopColor: "#eef2f7",
    backgroundColor: "#f8faff",
  },

  replyingInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  replyingText: {
    marginLeft: 7,
    fontSize: 12,
    color: "#64748b",
  },

  replyingName: {
    fontWeight: "800",
    color: "#4f46e5",
  },

  mediaPreviewContainer: {
    paddingTop: 8,
    paddingBottom: 5,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: "#eef2f7",
    backgroundColor: "#ffffff",
  },

  mediaPreviewContent: {
    paddingRight: 8,
  },

  mediaPreviewItem: {
    width: 72,
    height: 72,
    marginRight: 8,
    position: "relative",
    overflow: "visible",
  },

  mediaPreviewImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
  },

  videoPreview: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#334155",
  },

  videoLabel: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: "700",
    color: "#ffffff",
  },

  removeMediaButton: {
    position: "absolute",
    top: -7,
    right: -7,
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
    borderRadius: 11,
    backgroundColor: "#ef4444",
    zIndex: 10,
  },

  mediaCountText: {
    marginTop: 5,
    fontSize: 10,
    fontWeight: "600",
    color: "#64748b",
  },

  inputContainer: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom:
      Platform.OS === "ios"
        ? 20
        : 12,
    flexDirection: "row",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#eef2f7",
    backgroundColor: "#ffffff",
  },

  inputAvatar: {
    width: 34,
    height: 34,
    marginRight: 8,
    marginBottom: 3,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: "#eef2ff",
  },

  input: {
    flex: 1,
    maxHeight: 90,
    minHeight: 42,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 21,
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    fontSize: 13,
  },

  mediaButton: {
    width: 40,
    height: 40,
    marginLeft: 7,
    marginBottom: 3,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#eef2ff",
  },

  disabledMediaButton: {
    opacity: 0.45,
  },

  sendButton: {
    width: 42,
    height: 42,
    marginLeft: 7,
    marginBottom: 2,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: "#4f46e5",
  },

  disabledSendButton: {
    opacity: 0.45,
  },
});