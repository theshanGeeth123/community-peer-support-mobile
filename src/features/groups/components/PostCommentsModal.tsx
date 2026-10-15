import { useThemeTone, useThemedStyles } from '@/theme/useAlyvenAppearance';
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
  postContent,
  visible,
  currentUserId,
  canModerate,
  onClose,
}: {
  postId: string | null;
  postContent: string | null;
  visible: boolean;

  currentUserId?: string;
  canModerate: boolean;

  onClose: () => void;
}) {
  const themeStyles = useThemedStyles(styles);
  const themeTone = useThemeTone();

  const [comments, setComments] = useState<Comment[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<
    [string, string] | null
  >(null);
  const [loadingAiSuggestions, setLoadingAiSuggestions] =
    useState(false);

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

  useEffect(() => {
    setAiSuggestions(null);
    setLoadingAiSuggestions(false);
  }, [visible, postId]);

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

  const handleGenerateAiSuggestions = async () => {
    if (
      !postContent?.trim() ||
      loadingAiSuggestions
    ) {
      return;
    }

    try {
      setLoadingAiSuggestions(true);
      setError(null);

      const response =
        await commentApi.getAiSuggestions({
          postContent: postContent.trim(),
          tone: "supportive",
        });

      setAiSuggestions(response.data.suggestions);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoadingAiSuggestions(false);
    }
  };

  const selectAiSuggestion = (suggestion: string) => {
    setNewComment(suggestion);
    setAiSuggestions(null);
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
      <View style={themeStyles.mediaPreviewContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            themeStyles.mediaPreviewContent
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
                  style={themeStyles.mediaPreviewItem}
                >
                  {isVideo ? (
                    <View
                      style={
                        themeStyles.videoPreview
                      }
                    >
                      <Ionicons
                        name="play-circle"
                        size={34}
                        color={themeTone("#ffffff", "color")}
                      />

                      <Text
                        style={
                          themeStyles.videoLabel
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
                        themeStyles.mediaPreviewImage
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
                      themeStyles.removeMediaButton
                    }
                  >
                    <Ionicons
                      name="close"
                      size={15}
                      color={themeTone("#ffffff", "color")}
                    />
                  </Pressable>
                </View>
              );
            }
          )}
        </ScrollView>

        <Text style={themeStyles.mediaCountText}>
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
      <View style={themeStyles.savedMediaContainer}>
        {media.map((item, index) => {
          const isVideo = item.type === "video";

          return (
            <View
              key={`${item.url}-${index}`}
              style={themeStyles.savedMediaItem}
            >
              {isVideo ? (
                <View style={themeStyles.savedVideoContainer}>
                  <Ionicons
                    name="play-circle"
                    size={42}
                    color={themeTone("#ffffff", "color")}
                  />

                  <Text style={themeStyles.savedVideoLabel}>
                    Video
                  </Text>
                </View>
              ) : (
                <Image
                  source={{ uri: item.url }}
                  style={themeStyles.savedMediaImage}
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
          themeStyles.commentBlock,
          isReply &&
            themeStyles.replyBlock,
        ]}
      >
        <View style={themeStyles.commentRow}>
          <View style={themeStyles.avatar}>
            <Text
              style={
                themeStyles.avatarText
              }
            >
              {getInitials(
                comment.author.fullName
              )}
            </Text>
          </View>

          <View
            style={themeStyles.commentMain}
          >
            <View
              style={
                themeStyles.commentBubble
              }
            >
              <View
                style={
                  themeStyles.commentTopRow
                }
              >
                <Text
                  style={
                    themeStyles.authorName
                  }
                >
                  {
                    comment.author
                      .fullName
                  }
                </Text>

                <Text
                  style={
                    themeStyles.timeText
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
                    themeStyles.editContainer
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
                      themeStyles.editInput
                    }
                    placeholder="Edit your comment..."
                    placeholderTextColor={themeTone("#8BA3AB", "placeholderTextColor")}
                  />

                  <View
                    style={
                      themeStyles.editActions
                    }
                  >
                    <Pressable
                      onPress={
                        cancelInputMode
                      }
                      style={
                        themeStyles.cancelButton
                      }
                    >
                      <Text
                        style={
                          themeStyles.cancelText
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
                        themeStyles.saveButton,
                        (submitting ||
                          editText
                            .trim()
                            .length ===
                            0) &&
                          themeStyles.disabledButton,
                      ]}
                    >
                      {submitting ? (
                        <ActivityIndicator
                          size="small"
                          color={themeTone("#ffffff", "color")}
                        />
                      ) : (
                        <Text
                          style={
                            themeStyles.saveText
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
                      themeStyles.commentContent
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
                      themeStyles.reactionPicker
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
                              themeStyles.reactionOption,
                              selected &&
                                themeStyles.reactionOptionSelected,
                            ]}
                          >
                            <Text
                              style={
                                themeStyles.reactionEmoji
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
                    themeStyles.commentActions
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
                      themeStyles.smallAction,
                      currentReaction.reaction &&
                        themeStyles.reactedAction,
                    ]}
                  >
                    <Text
                      style={
                        themeStyles.selectedReactionEmoji
                      }
                    >
                      {reactionEmoji ??
                        "♡"}
                    </Text>

                    <Text
                      style={[
                        themeStyles.smallActionText,
                        currentReaction.reaction &&
                          themeStyles.reactionCountText,
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
                        themeStyles.smallAction
                      }
                    >
                      <Ionicons
                        name="return-down-forward-outline"
                        size={16}
                        color={themeTone("#64808C", "color")}
                      />

                      <Text
                        style={
                          themeStyles.smallActionText
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
                        themeStyles.smallAction,
                        isPinned &&
                          themeStyles.pinnedAction,
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
                            ? "#0E7C86"
                            : "#64808C"
                        }
                      />

                      <Text
                        style={[
                          themeStyles.smallActionText,
                          isPinned &&
                            themeStyles.pinnedActionText,
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
                        themeStyles.smallAction
                      }
                    >
                      <Ionicons
                        name="create-outline"
                        size={16}
                        color={themeTone("#64808C", "color")}
                      />

                      <Text
                        style={
                          themeStyles.smallActionText
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
                        themeStyles.smallAction
                      }
                    >
                      <Ionicons
                        name="trash-outline"
                        size={15}
                        color={themeTone("#ef4444", "color")}
                      />

                      <Text
                        style={
                          themeStyles.deleteText
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
                themeStyles.repliesContainer
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
        style={themeStyles.keyboardView}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <View
          style={themeStyles.overlay}
        >
          <Pressable
            style={themeStyles.backdrop}
            onPress={onClose}
          />

          <View
            style={themeStyles.container}
          >
            <View
              style={themeStyles.header}
            >
              <View>
                <Text
                  style={themeStyles.title}
                >
                  Comments
                </Text>

                {!loading && (
                  <Text
                    style={
                      themeStyles.commentCount
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
                  themeStyles.closeButton
                }
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={themeTone("#31515F", "color")}
                />
              </Pressable>
            </View>

            <View style={themeStyles.searchSortContainer}>
              <View style={themeStyles.searchContainer}>
                <Ionicons
                  name="search-outline"
                  size={18}
                  color={themeTone("#8BA3AB", "color")}
                />

                <TextInput
                  value={commentSearch}
                  onChangeText={setCommentSearch}
                  placeholder="Search comments..."
                  placeholderTextColor={themeTone("#8BA3AB", "placeholderTextColor")}
                  style={themeStyles.searchInput}
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
                      color={themeTone("#8BA3AB", "color")}
                    />
                  </Pressable>
                )}
              </View>

              <View style={themeStyles.sortContainer}>
                <Pressable
                  onPress={() =>
                    setShowSortOptions(
                      (previous) => !previous
                    )
                  }
                  style={themeStyles.sortButton}
                >
                  <Ionicons
                    name="swap-vertical-outline"
                    size={17}
                    color={themeTone("#0E7C86", "color")}
                  />

                  <Text style={themeStyles.sortButtonText}>
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
                    color={themeTone("#64808C", "color")}
                  />
                </Pressable>

                {showSortOptions && (
                  <View style={themeStyles.sortOptions}>
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
                          themeStyles.sortOption,
                          commentSort ===
                            option.value &&
                            themeStyles.sortOptionSelected,
                        ]}
                      >
                        <Text
                          style={[
                            themeStyles.sortOptionText,
                            commentSort ===
                              option.value &&
                              themeStyles.sortOptionSelectedText,
                          ]}
                        >
                          {option.label}
                        </Text>

                        {commentSort ===
                          option.value && (
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color={themeTone("#0E7C86", "color")}
                          />
                        )}
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <ScrollView
              style={themeStyles.list}
              contentContainerStyle={
                themeStyles.listContent
              }
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={
                false
              }
            >
              {loading ? (
                <View
                  style={
                    themeStyles.loadingContainer
                  }
                >
                  <ActivityIndicator
                    size="large"
                    color={themeTone("#0E7C86", "color")}
                  />

                  <Text
                    style={
                      themeStyles.loadingText
                    }
                  >
                    Loading comments...
                  </Text>
                </View>
              ) : filteredRootComments.length ===
                0 ? (
                <View
                  style={
                    themeStyles.emptyContainer
                  }
                >
                  <View
                    style={
                      themeStyles.emptyIcon
                    }
                  >
                    <Ionicons
                      name={
                        normalizedSearch
                          ? "search-outline"
                          : "chatbubble-ellipses-outline"
                      }
                      size={32}
                      color={themeTone("#168994", "color")}
                    />
                  </View>

                  <Text
                    style={
                      themeStyles.emptyTitle
                    }
                  >
                    {normalizedSearch
                      ? "No matching comments"
                      : "No comments yet"}
                  </Text>

                  <Text
                    style={
                      themeStyles.emptyText
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
                    themeStyles.errorContainer
                  }
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={18}
                    color={themeTone("#b91c1c", "color")}
                  />

                  <Text
                    style={
                      themeStyles.errorText
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
                  themeStyles.replyingBanner
                }
              >
                <View
                  style={
                    themeStyles.replyingInfo
                  }
                >
                  <Ionicons
                    name="return-down-forward-outline"
                    size={17}
                    color={themeTone("#0E7C86", "color")}
                  />

                  <Text
                    style={
                      themeStyles.replyingText
                    }
                    numberOfLines={1}
                  >
                    Replying to{" "}
                    <Text
                      style={
                        themeStyles.replyingName
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
                    color={themeTone("#8BA3AB", "color")}
                  />
                </Pressable>
              </View>
            )}

            {renderMediaPreview()}

            {(aiSuggestions || loadingAiSuggestions) && (
              <View style={themeStyles.aiSuggestionsContainer}>
                <View style={themeStyles.aiSuggestionsHeader}>
                  <Text style={themeStyles.aiSuggestionsTitle}>
                    Choose a supportive comment
                  </Text>

                  <Pressable
                    onPress={() => setAiSuggestions(null)}
                    hitSlop={8}
                  >
                    <Ionicons
                      name="close"
                      size={18}
                      color={themeTone("#64808C", "color")}
                    />
                  </Pressable>
                </View>

                {loadingAiSuggestions ? (
                  <View style={themeStyles.aiLoadingRow}>
                    <ActivityIndicator
                      size="small"
                      color={themeTone("#0E7C86", "color")}
                    />
                    <Text style={themeStyles.aiLoadingText}>
                      Generating suggestions...
                    </Text>
                  </View>
                ) : (
                  aiSuggestions?.map((suggestion) => (
                    <Pressable
                      key={suggestion}
                      onPress={() =>
                        selectAiSuggestion(suggestion)
                      }
                      style={themeStyles.aiSuggestionCard}
                    >
                      <Text style={themeStyles.aiSuggestionText}>
                        {suggestion}
                      </Text>
                      <Text style={themeStyles.aiSelectText}>
                        Use this
                      </Text>
                    </Pressable>
                  ))
                )}

                {!loadingAiSuggestions && (
                  <Pressable
                    onPress={() =>
                      void handleGenerateAiSuggestions()
                    }
                    style={themeStyles.aiRegenerateButton}
                  >
                    <Ionicons
                      name="refresh-outline"
                      size={16}
                      color={themeTone("#0E7C86", "color")}
                    />
                    <Text style={themeStyles.aiRegenerateText}>
                      Regenerate
                    </Text>
                  </Pressable>
                )}
              </View>
            )}

            <View style={themeStyles.aiSuggestRow}>
              <Pressable
                disabled={
                  loadingAiSuggestions ||
                  !postContent?.trim()
                }
                onPress={() =>
                  void handleGenerateAiSuggestions()
                }
                style={[
                  themeStyles.aiSuggestButton,
                  (loadingAiSuggestions ||
                    !postContent?.trim()) &&
                    themeStyles.disabledAiSuggestButton,
                ]}
              >
                <Ionicons
                  name="sparkles-outline"
                  size={16}
                  color={themeTone("#0E7C86", "color")}
                />
                <Text style={themeStyles.aiSuggestText}>
                  AI Suggest
                </Text>
              </Pressable>
            </View>

            <View
              style={
                themeStyles.inputContainer
              }
            >
              <View
                style={
                  themeStyles.inputAvatar
                }
              >
                <Ionicons
                  name="person"
                  size={18}
                  color={themeTone("#0E7C86", "color")}
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
                placeholderTextColor={themeTone("#8BA3AB", "placeholderTextColor")}
                style={themeStyles.input}
                multiline
                maxLength={1000}
              />

              <Pressable
                disabled={submitting}
                onPress={() =>
                  void handleSelectMedia()
                }
                style={[
                  themeStyles.mediaButton,
                  submitting &&
                    themeStyles.disabledMediaButton,
                ]}
              >
                <Ionicons
                  name="image-outline"
                  size={21}
                  color={themeTone("#0E7C86", "color")}
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
                  themeStyles.sendButton,
                  (submitting ||
                    newComment
                      .trim()
                      .length ===
                      0) &&
                    themeStyles.disabledSendButton,
                ]}
              >
                {submitting ? (
                  <ActivityIndicator
                    size="small"
                    color={themeTone("#ffffff", "color")}
                  />
                ) : (
                  <Ionicons
                    name="arrow-up"
                    size={20}
                    color={themeTone("#ffffff", "color")}
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
    color: "#0E2A47",
  },

  commentCount: {
    marginTop: 2,
    fontSize: 12,
    color: "#8BA3AB",
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
    borderColor: "#E0EDEB",
    borderRadius: 12,
    backgroundColor: "#F5FAF9",
  },

  searchInput: {
    flex: 1,
    marginLeft: 7,
    paddingVertical: 8,
    color: "#0E2A47",
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
    borderColor: "#E0EDEB",
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },

  sortButtonText: {
    marginHorizontal: 5,
    fontSize: 12,
    fontWeight: "700",
    color: "#31515F",
  },

  sortOptions: {
    position: "absolute",
    top: 45,
    right: 0,
    width: 145,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#E0EDEB",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    shadowColor: "#0E2A47",
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
    backgroundColor: "#EAF8F5",
  },

  sortOptionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4D6C78",
  },

  sortOptionSelectedText: {
    color: "#0E7C86",
    fontWeight: "700",
  },

  closeButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: "#F5FAF9",
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
    color: "#8BA3AB",
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
    backgroundColor: "#EAF8F5",
  },

  emptyTitle: {
    marginTop: 15,
    fontSize: 17,
    fontWeight: "800",
    color: "#0E2A47",
  },

  emptyText: {
    marginTop: 7,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    color: "#8BA3AB",
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
    backgroundColor: "#EAF8F5",
  },

  avatarText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0E7C86",
  },

  commentMain: {
    flex: 1,
    marginLeft: 10,
  },

  commentBubble: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 17,
    backgroundColor: "#F5FAF9",
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
    color: "#0E2A47",
  },

  timeText: {
    marginLeft: 8,
    fontSize: 10,
    color: "#8BA3AB",
  },

  commentContent: {
    marginTop: 5,
    fontSize: 14,
    lineHeight: 20,
    color: "#31515F",
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
    backgroundColor: "#E0EDEB",
  },

  savedMediaImage: {
    width: "100%",
    height: "100%",
  },

  savedVideoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#31515F",
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
    borderColor: "#E0EDEB",
    borderRadius: 999,
    backgroundColor: "#ffffff",
    shadowColor: "#0E2A47",
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
    backgroundColor: "#EAF8F5",
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
    backgroundColor: "#F5FAF9",
  },

  pinnedAction: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#EAF8F5",
  },

  pinnedActionText: {
    color: "#0E7C86",
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
    color: "#64808C",
  },

  reactionCountText: {
    color: "#0E7C86",
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
    borderLeftColor: "#E0EDEB",
  },

  editContainer: {
    marginTop: 8,
  },

  editInput: {
    minHeight: 65,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#B7E7DA",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    color: "#0E2A47",
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
    color: "#64808C",
  },

  saveButton: {
    minWidth: 55,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#0E7C86",
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
    color: "#64808C",
  },

  replyingName: {
    fontWeight: "800",
    color: "#0E7C86",
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
    backgroundColor: "#EDF5F4",
  },

  videoPreview: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#31515F",
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
    color: "#64808C",
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

  aiSuggestRow: {
    paddingHorizontal: 14,
    paddingTop: 8,
    backgroundColor: "#ffffff",
  },

  aiSuggestButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: "#EAF8F5",
  },

  disabledAiSuggestButton: {
    opacity: 0.45,
  },

  aiSuggestText: {
    marginLeft: 5,
    color: "#09646E",
    fontSize: 12,
    fontWeight: "700",
  },

  aiSuggestionsContainer: {
    marginHorizontal: 14,
    marginBottom: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#B7E7DA",
    borderRadius: 14,
    backgroundColor: "#EAF8F5",
  },

  aiSuggestionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  aiSuggestionsTitle: {
    color: "#0E2A47",
    fontSize: 12,
    fontWeight: "700",
  },

  aiLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },

  aiLoadingText: {
    marginLeft: 8,
    color: "#4D6C78",
    fontSize: 12,
  },

  aiSuggestionCard: {
    marginTop: 6,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },

  aiSuggestionText: {
    color: "#31515F",
    fontSize: 13,
    lineHeight: 19,
  },

  aiSelectText: {
    marginTop: 6,
    color: "#0E7C86",
    fontSize: 11,
    fontWeight: "700",
  },

  aiRegenerateButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
  },

  aiRegenerateText: {
    marginLeft: 4,
    color: "#0E7C86",
    fontSize: 12,
    fontWeight: "700",
  },

  inputAvatar: {
    width: 34,
    height: 34,
    marginRight: 8,
    marginBottom: 3,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: "#EAF8F5",
  },

  input: {
    flex: 1,
    maxHeight: 90,
    minHeight: 42,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E0EDEB",
    borderRadius: 21,
    backgroundColor: "#F5FAF9",
    color: "#0E2A47",
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
    backgroundColor: "#EAF8F5",
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
    backgroundColor: "#0E7C86",
  },

  disabledSendButton: {
    opacity: 0.45,
  },
});