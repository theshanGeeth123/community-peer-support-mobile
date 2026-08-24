import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
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

import { commentApi } from "@/features/groups/api/comment.api";
import type { Comment } from "@/features/groups/types/comment.types";

import { getApiErrorMessage } from "@/services/api/apiError";

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

  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  const [editingComment, setEditingComment] =
    useState<Comment | null>(null);

  const [editText, setEditText] = useState("");

  const [heartState, setHeartState] = useState<
    Record<
      string,
      {
        liked: boolean;
        count: number;
      }
    >
  >({});

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

      /*
       * We intentionally use the existing post endpoint for
       * retrieving comments.
       */
      const response = await fetchComments(postId);

      setComments(response);

      /*
       * Initialize local heart state from backend data if available.
       */
      const initialHeartState: Record<
        string,
        {
          liked: boolean;
          count: number;
        }
      > = {};

      response.forEach((comment) => {
        initialHeartState[comment.id] = {
          liked: comment.heartedByMe ?? false,
          count: comment.heartCount ?? 0,
        };
      });

      setHeartState(initialHeartState);
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
  |
  | We keep this small helper here because your current backend already
  | exposes GET /posts/:postId/comments through postApi.
  |
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

  const rootComments = useMemo(() => {
    return comments.filter(
      (comment) => !comment.parentComment
    );
  }, [comments]);

  /*
  |--------------------------------------------------------------------------
  | GET REPLIES
  |--------------------------------------------------------------------------
  */

  const getReplies = (commentId: string) => {
    return comments.filter(
      (comment) => comment.parentComment === commentId
    );
  };

  /*
  |--------------------------------------------------------------------------
  | ADD COMMENT
  |--------------------------------------------------------------------------
  */

  const handleAddComment = async () => {
    if (!postId || newComment.trim().length === 0) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await commentApi.createComment(postId, {
        content: newComment.trim(),
      });

      setComments((previous) => [
        ...previous,
        response.data.comment,
      ]);

      setNewComment("");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
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

      const response = await commentApi.createReply(
        replyingTo.id,
        {
          content: newComment.trim(),
        }
      );

      setComments((previous) => [
        ...previous,
        response.data.reply,
      ]);

      setNewComment("");
      setReplyingTo(null);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
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

      await commentApi.deleteComment(commentId);

      setComments((previous) =>
        previous.filter(
          (comment) =>
            comment.id !== commentId &&
            comment.parentComment !== commentId
        )
      );

      setHeartState((previous) => {
        const next = { ...previous };
        delete next[commentId];
        return next;
      });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CONFIRM DELETE
  |--------------------------------------------------------------------------
  */

  const confirmDelete = (comment: Comment) => {
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
            void handleDeleteComment(comment.id),
        },
      ]
    );
  };

  /*
  |--------------------------------------------------------------------------
  | START EDIT
  |--------------------------------------------------------------------------
  */

  const startEdit = (comment: Comment) => {
    setEditingComment(comment);
    setEditText(comment.content);
    setError(null);
  };

  /*
  |--------------------------------------------------------------------------
  | UPDATE COMMENT
  |--------------------------------------------------------------------------
  */

  const handleUpdateComment = async () => {
    if (
      !editingComment ||
      editText.trim().length === 0
    ) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await commentApi.updateComment(
        editingComment.id,
        {
          content: editText.trim(),
        }
      );

      setComments((previous) =>
        previous.map((comment) =>
          comment.id === editingComment.id
            ? response.data.comment
            : comment
        )
      );

      setEditingComment(null);
      setEditText("");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | HEART COMMENT
  |--------------------------------------------------------------------------
  */

  const handleToggleHeart = async (
    comment: Comment
  ) => {
    try {
      setError(null);

      const response =
        await commentApi.toggleHeart(comment.id);

      setHeartState((previous) => ({
        ...previous,
        [comment.id]: {
          liked: response.data.liked,
          count: response.data.heartCount,
        },
      }));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  /*
  |--------------------------------------------------------------------------
  | OPEN REPLY
  |--------------------------------------------------------------------------
  */

  const startReply = (comment: Comment) => {
    setReplyingTo(comment);
    setEditingComment(null);
    setNewComment("");
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
      comment.author.id === currentUserId;

    const currentHeart =
      heartState[comment.id] ?? {
        liked: comment.heartedByMe ?? false,
        count: comment.heartCount ?? 0,
      };

    const replies = isReply
      ? []
      : getReplies(comment.id);

    return (
      <View
        key={comment.id}
        style={[
          styles.commentBlock,
          isReply && styles.replyBlock,
        ]}
      >
        <View style={styles.commentRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(
                comment.author.fullName
              )}
            </Text>
          </View>

          <View style={styles.commentMain}>
            <View style={styles.commentBubble}>
              <View style={styles.commentTopRow}>
                <Text style={styles.authorName}>
                  {comment.author.fullName}
                </Text>

                <Text style={styles.timeText}>
                  {formatRelativeTime(
                    comment.createdAt
                  )}
                </Text>
              </View>

              {editingComment?.id === comment.id ? (
                <View style={styles.editContainer}>
                  <TextInput
                    value={editText}
                    onChangeText={setEditText}
                    multiline
                    autoFocus
                    style={styles.editInput}
                    placeholder="Edit your comment..."
                    placeholderTextColor="#94a3b8"
                  />

                  <View style={styles.editActions}>
                    <Pressable
                      onPress={cancelInputMode}
                      style={styles.cancelButton}
                    >
                      <Text style={styles.cancelText}>
                        Cancel
                      </Text>
                    </Pressable>

                    <Pressable
                      disabled={
                        submitting ||
                        editText.trim().length === 0
                      }
                      onPress={() =>
                        void handleUpdateComment()
                      }
                      style={[
                        styles.saveButton,
                        (submitting ||
                          editText.trim().length === 0) &&
                          styles.disabledButton,
                      ]}
                    >
                      {submitting ? (
                        <ActivityIndicator
                          size="small"
                          color="#ffffff"
                        />
                      ) : (
                        <Text style={styles.saveText}>
                          Save
                        </Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Text style={styles.commentContent}>
                  {comment.content}
                </Text>
              )}
            </View>

            {editingComment?.id !== comment.id && (
              <View style={styles.commentActions}>
                <Pressable
                  onPress={() =>
                    void handleToggleHeart(comment)
                  }
                  style={styles.smallAction}
                >
                  <Ionicons
                    name={
                      currentHeart.liked
                        ? "heart"
                        : "heart-outline"
                    }
                    size={17}
                    color={
                      currentHeart.liked
                        ? "#ef4444"
                        : "#64748b"
                    }
                  />

                  <Text
                    style={[
                      styles.smallActionText,
                      currentHeart.liked &&
                        styles.heartText,
                    ]}
                  >
                    {currentHeart.count}
                  </Text>
                </Pressable>

                {!isReply && (
                  <Pressable
                    onPress={() => startReply(comment)}
                    style={styles.smallAction}
                  >
                    <Ionicons
                      name="return-down-forward-outline"
                      size={16}
                      color="#64748b"
                    />

                    <Text style={styles.smallActionText}>
                      Reply
                    </Text>
                  </Pressable>
                )}

                {canModify && (
                  <Pressable
                    onPress={() => startEdit(comment)}
                    style={styles.smallAction}
                  >
                    <Ionicons
                      name="create-outline"
                      size={16}
                      color="#64748b"
                    />

                    <Text style={styles.smallActionText}>
                      Edit
                    </Text>
                  </Pressable>
                )}

                {canModify && (
                  <Pressable
                    onPress={() =>
                      confirmDelete(comment)
                    }
                    style={styles.smallAction}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={15}
                      color="#ef4444"
                    />

                    <Text style={styles.deleteText}>
                      Delete
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        </View>

        {!isReply &&
          replies.length > 0 && (
            <View style={styles.repliesContainer}>
              {replies.map((reply) =>
                renderComment(reply, true)
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
        <View style={styles.overlay}>
          <Pressable
            style={styles.backdrop}
            onPress={onClose}
          />

          <View style={styles.container}>
            {/* HEADER */}

            <View style={styles.header}>
              <View>
                <Text style={styles.title}>
                  Comments
                </Text>

                {!loading && (
                  <Text style={styles.commentCount}>
                    {comments.length}{" "}
                    {comments.length === 1
                      ? "comment"
                      : "comments"}
                  </Text>
                )}
              </View>

              <Pressable
                hitSlop={10}
                onPress={onClose}
                style={styles.closeButton}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color="#334155"
                />
              </Pressable>
            </View>

            {/* COMMENTS */}

            <ScrollView
              style={styles.list}
              contentContainerStyle={
                styles.listContent
              }
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size="large"
                    color="#4f46e5"
                  />

                  <Text style={styles.loadingText}>
                    Loading comments...
                  </Text>
                </View>
              ) : rootComments.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIcon}>
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={32}
                      color="#6366f1"
                    />
                  </View>

                  <Text style={styles.emptyTitle}>
                    No comments yet
                  </Text>

                  <Text style={styles.emptyText}>
                    Start the conversation and
                    support your community.
                  </Text>
                </View>
              ) : (
                rootComments.map((comment) =>
                  renderComment(comment)
                )
              )}

              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={18}
                    color="#b91c1c"
                  />

                  <Text style={styles.errorText}>
                    {error}
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* INPUT MODE */}

            {replyingTo && (
              <View style={styles.replyingBanner}>
                <View style={styles.replyingInfo}>
                  <Ionicons
                    name="return-down-forward-outline"
                    size={17}
                    color="#4f46e5"
                  />

                  <Text
                    style={styles.replyingText}
                    numberOfLines={1}
                  >
                    Replying to{" "}
                    <Text style={styles.replyingName}>
                      {replyingTo.author.fullName}
                    </Text>
                  </Text>
                </View>

                <Pressable
                  onPress={cancelInputMode}
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

            {/* INPUT */}

            <View style={styles.inputContainer}>
              <View style={styles.inputAvatar}>
                <Ionicons
                  name="person"
                  size={18}
                  color="#4f46e5"
                />
              </View>

              <TextInput
                value={newComment}
                onChangeText={setNewComment}
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
                disabled={
                  submitting ||
                  newComment.trim().length === 0
                }
                onPress={() =>
                  void (replyingTo
                    ? handleAddReply()
                    : handleAddComment())
                }
                style={[
                  styles.sendButton,
                  (submitting ||
                    newComment.trim().length === 0) &&
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
    justifyContent: "space-between",
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
    justifyContent: "space-between",
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

  smallActionText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
  },

  heartText: {
    color: "#ef4444",
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
    justifyContent: "space-between",
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

  inputContainer: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 20 : 12,
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

  sendButton: {
    width: 42,
    height: 42,
    marginLeft: 8,
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