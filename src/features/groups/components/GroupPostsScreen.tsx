import { useCallback, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import { useAuth } from "@/features/auth/hooks/useAuth";

import { groupApi } from "@/features/groups/api/group.api";
import { groupMembershipApi } from "@/features/groups/api/groupMembership.api";
import { postApi } from "@/features/groups/api/post.api";

import type { SupportGroup } from "@/features/groups/types/group.types";
import type { Post } from "@/features/groups/types/post.types";

import { getApiErrorMessage } from "@/services/api/apiError";

import CreatePostComposer from "./CreatePostComposer";
import PostCard from "./PostCard";
import PostCommentsModal from "./PostCommentsModal";

type ReferenceWithId = { id?: string; _id?: string };

function getReferenceId(
  reference: string | ReferenceWithId | null | undefined
): string | null {
  if (!reference) {
    return null;
  }

  if (typeof reference === "string") {
    return reference;
  }

  return reference.id ?? reference._id ?? null;
}

export default function GroupPostsScreen() {
  const params = useLocalSearchParams();
  const rawGroupId = params.groupId;
  const groupId = Array.isArray(rawGroupId) ? rawGroupId[0] : rawGroupId;

  const { user } = useAuth();

  const [group, setGroup] = useState<SupportGroup | null>(null);
  const [canPost, setCanPost] = useState(false);
  const [canModerateAll, setCanModerateAll] = useState(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittingPost, setSubmittingPost] = useState(false);

  const [activeCommentsPostId, setActiveCommentsPostId] = useState<
    string | null
  >(null);

  const loadEverything = useCallback(
    async (showLoading = true) => {
      if (!groupId || !user) {
        return;
      }

      try {
        if (showLoading) {
          setLoading(true);
        }

        setError(null);

        const groupResponse = await groupApi.getGroup(groupId);
        const fetchedGroup = groupResponse.data.group;

        setGroup(fetchedGroup);

        const isAssignedStaff =
          (user.role === "MODERATOR" &&
            fetchedGroup.moderators.some(
              (reference) => getReferenceId(reference) === user.id
            )) ||
          (user.role === "PEER_SUPPORTER" &&
            fetchedGroup.peerSupporters.some(
              (reference) => getReferenceId(reference) === user.id
            ));

        const canModerate = user.role === "ADMIN" || isAssignedStaff;

        setCanModerateAll(canModerate);

        let hasActiveMembership = false;

        if (user.role === "USER") {
          const membershipsResponse =
            await groupMembershipApi.getMyJoinedGroups();

          hasActiveMembership = (
            membershipsResponse.data.memberships ?? []
          ).some(
            (membership) =>
              membership.status === "ACTIVE" &&
              getReferenceId(membership.group) === groupId
          );
        }

        setCanPost(hasActiveMembership);

        const postsResponse = await postApi.listPosts(groupId);

        setPosts(postsResponse.data.posts ?? []);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [groupId, user]
  );

  useFocusEffect(
    useCallback(() => {
      void loadEverything();

      return undefined;
    }, [loadEverything])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    void loadEverything(false);
  };

  const handleCreatePost = async (content: string, isAnonymous: boolean) => {
    if (!groupId) {
      return;
    }

    try {
      setSubmittingPost(true);

      const response = await postApi.createPost(groupId, {
        content,
        isAnonymous,
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
      const response = await postApi.toggleLike(postId);

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
      void loadEverything(false);
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
      await postApi.deletePost(postId);

      setPosts((previous) => previous.filter((post) => post.id !== postId));
    } catch (requestError) {
      Alert.alert("Unable to delete post", getApiErrorMessage(requestError));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
        </Pressable>

        <Text numberOfLines={1} style={styles.headerTitle}>
          {group?.name ?? "Posts"}
        </Text>

        <View style={{ width: 42 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {canPost && (
          <CreatePostComposer
            currentUserName={user?.fullName}
            submitting={submittingPost}
            onSubmit={(content, isAnonymous) =>
              void handleCreatePost(content, isAnonymous)
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

            <Text style={styles.loadingText}>Loading posts...</Text>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="chatbubbles-outline"
                size={29}
                color="#4f46e5"
              />
            </View>

            <Text style={styles.emptyTitle}>No posts yet</Text>

            <Text style={styles.emptyDescription}>
              {canPost
                ? "Be the first to share something with the group."
                : "Nothing has been posted in this group yet."}
            </Text>
          </View>
        ) : (
          posts.map((post) => (
            <PostCard
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

      <PostCommentsModal
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
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
  },

  headerTitle: {
    flex: 1,
    marginHorizontal: 10,
    textAlign: "center",
    fontSize: 17,
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
