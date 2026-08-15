import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
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

import { postApi } from "@/features/groups/api/post.api";

import type { PostComment } from "@/features/groups/types/post.types";

import { getApiErrorMessage } from "@/services/api/apiError";

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
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadComments = useCallback(async () => {
    if (!postId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await postApi.listComments(postId);

      setComments(response.data.comments ?? []);
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

  const handleAddComment = async () => {
    if (!postId || newComment.trim().length === 0) {
      return;
    }

    try {
      setSubmitting(true);

      const response = await postApi.createComment(postId, {
        content: newComment.trim(),
      });

      setComments((previous) => [...previous, response.data.comment]);
      setNewComment("");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await postApi.deleteComment(commentId);

      setComments((previous) =>
        previous.filter((comment) => comment.id !== commentId)
      );
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.overlay}>
          <Pressable style={{ flex: 1 }} onPress={onClose} />

          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Comments</Text>

              <Pressable hitSlop={10} onPress={onClose}>
                <Ionicons name="close" size={24} color="#475569" />
              </Pressable>
            </View>

            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
            >
              {loading ? (
                <ActivityIndicator
                  size="large"
                  color="#4f46e5"
                  style={{ marginTop: 20 }}
                />
              ) : comments.length === 0 ? (
                <Text style={styles.emptyText}>
                  No comments yet. Be the first to reply.
                </Text>
              ) : (
                comments.map((comment) => {
                  const canDelete =
                    canModerate || comment.author.id === currentUserId;

                  return (
                    <View key={comment.id} style={styles.commentRow}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentAuthor}>
                          {comment.author.fullName}
                        </Text>

                        {canDelete && (
                          <Pressable
                            hitSlop={10}
                            onPress={() =>
                              void handleDeleteComment(comment.id)
                            }
                          >
                            <Ionicons
                              name="trash-outline"
                              size={16}
                              color="#94a3b8"
                            />
                          </Pressable>
                        )}
                      </View>

                      <Text style={styles.commentContent}>
                        {comment.content}
                      </Text>
                    </View>
                  );
                })
              )}

              {error && <Text style={styles.errorText}>{error}</Text>}
            </ScrollView>

            <View style={styles.inputRow}>
              <TextInput
                value={newComment}
                onChangeText={setNewComment}
                editable={!submitting}
                placeholder="Write a comment..."
                placeholderTextColor="#94a3b8"
                style={styles.input}
                multiline
              />

              <Pressable
                disabled={submitting || newComment.trim().length === 0}
                onPress={() => void handleAddComment()}
                style={[
                  styles.sendButton,
                  (submitting || newComment.trim().length === 0) && {
                    opacity: 0.5,
                  },
                ]}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Ionicons name="send" size={16} color="#ffffff" />
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },

  container: {
    height: "75%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: "#ffffff",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },

  list: {
    flex: 1,
  },

  listContent: {
    padding: 20,
  },

  emptyText: {
    marginTop: 20,
    textAlign: "center",
    color: "#94a3b8",
  },

  commentRow: {
    marginBottom: 16,
  },

  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  commentAuthor: {
    fontWeight: "700",
    fontSize: 13,
    color: "#0f172a",
  },

  commentContent: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 19,
    color: "#475569",
  },

  errorText: {
    marginTop: 10,
    color: "#b91c1c",
  },

  inputRow: {
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },

  input: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 16,
    fontSize: 14,
    color: "#0f172a",
  },

  sendButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#4f46e5",
  },
});
