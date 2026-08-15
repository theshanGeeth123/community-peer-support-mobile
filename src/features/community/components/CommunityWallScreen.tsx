import { useCallback, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import { useFocusEffect } from "expo-router";

import { useAuth } from "@/features/auth/hooks/useAuth";

import { globalPostApi } from "@/features/community/api/globalPost.api";

import type { GlobalPost } from "@/features/community/types/globalPost.types";

import { getApiErrorMessage } from "@/services/api/apiError";

import CreateGlobalPostComposer from "./CreateGlobalPostComposer";
import GlobalPostCard from "./GlobalPostCard";
import GlobalPostCommentsModal from "./GlobalPostCommentsModal";

export default function CommunityWallScreen() {
  const { user } = useAuth();

  const canPost = user?.role !== "USER";
  const canModerateAll = user?.role === "ADMIN" || user?.role === "MODERATOR";

  const [posts, setPosts] = useState<GlobalPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittingPost, setSubmittingPost] = useState(false);

  const [activeCommentsPostId, setActiveCommentsPostId] = useState<
    string | null
  >(null);

  const loadFeed = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setError(null);

      const response = await globalPostApi.listFeed();

      setPosts(response.data.posts ?? []);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadFeed();

      return undefined;
    }, [loadFeed])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    void loadFeed(false);
  };

  const handleCreatePost = async (content: string, isPinned: boolean) => {
    try {
      setSubmittingPost(true);

      const response = await globalPostApi.createPost({
        content,
        isPinned,
        postType: isPinned ? "announcement" : "post",
      });

      setPosts((previous) => [response.data.post, ...previous]);
    } catch (requestError) {
      Alert.alert("Unable to post", getApiErrorMessage(requestError));
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    setPosts((previous) =>
      previous.map((post) =>
        post.id === postId
          ? {
              ...post,
              likedByMe: !post.likedByMe,
              likeCount: post.likedByMe
                ? post.likeCount - 1
                : post.likeCount + 1,
            }
          : post
      )
    );

    try {
      const response = await globalPostApi.toggleLike(postId);

      setPosts((previous) =>
        previous.map((post) =>
          post.id === postId
            ? {
                ...post,
                likedByMe: response.data.liked,
                likeCount: response.data.likeCount,
              }
            : post
        )
      );
    } catch (requestError) {
      Alert.alert("Unable to update like", getApiErrorMessage(requestError));
      void loadFeed(false);
    }
  };

  const handleDeletePost = (postId: string) => {
    Alert.alert("Delete post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => void confirmDeletePost(postId),
      },
    ]);
  };

  const confirmDeletePost = async (postId: string) => {
    try {
      await globalPostApi.deletePost(postId);

      setPosts((previous) => previous.filter((post) => post.id !== postId));
    } catch (requestError) {
      Alert.alert("Unable to delete post", getApiErrorMessage(requestError));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {canPost && (
          <CreateGlobalPostComposer
            currentUserName={user?.fullName}
            submitting={submittingPost}
            canPin={canModerateAll}
            onSubmit={(content, isPinned) =>
              void handleCreatePost(content, isPinned)
            }
          />
        )}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#4f46e5" />

            <Text style={styles.loadingText}>Loading community wall...</Text>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons name="globe-outline" size={29} color="#4f46e5" />
            </View>

            <Text style={styles.emptyTitle}>Nothing here yet</Text>

            <Text style={styles.emptyDescription}>
              {canPost
                ? "Share the first update with the whole community."
                : "Check back soon for announcements and updates."}
            </Text>
          </View>
        ) : (
          posts.map((post) => (
            <GlobalPostCard
              key={post.id}
              post={post}
              currentUserId={user?.id}
              canModerate={canModerateAll}
              onToggleLike={() => void handleToggleLike(post.id)}
              onOpenComments={() => setActiveCommentsPostId(post.id)}
              onDelete={() => handleDeletePost(post.id)}
            />
          ))
        )}
      </ScrollView>

      <GlobalPostCommentsModal
        postId={activeCommentsPostId}
        visible={activeCommentsPostId !== null}
        currentUserId={user?.id}
        canModerate={canModerateAll}
        onClose={() => setActiveCommentsPostId(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  header: {
    height: 62,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
  },

  content: {
    padding: 20,
    paddingBottom: 70,
  },

  errorBox: {
    marginTop: 15,
    padding: 14,
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 14,
    backgroundColor: "#fef2f2",
  },

  errorText: {
    color: "#b91c1c",
  },

  center: {
    paddingVertical: 80,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#64748b",
  },

  emptyCard: {
    marginTop: 20,
    paddingVertical: 50,
    paddingHorizontal: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 20,
    backgroundColor: "#ffffff",
  },

  emptyIcon: {
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 31,
    backgroundColor: "#eef2ff",
  },

  emptyTitle: {
    marginTop: 13,
    fontSize: 17,
    fontWeight: "700",
    color: "#475569",
  },

  emptyDescription: {
    marginTop: 6,
    maxWidth: 280,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    color: "#94a3b8",
  },
});
