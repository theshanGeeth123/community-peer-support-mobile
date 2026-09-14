import { useCallback, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import { router, useFocusEffect, type Href } from "expo-router";

import { useAuth } from "@/features/auth/hooks/useAuth";

import { groupMembershipApi } from "@/features/groups/api/groupMembership.api";
import { postApi } from "@/features/groups/api/post.api";

import CreatePostComposer, {
  type ComposerGroupOption,
} from "@/features/groups/components/CreatePostComposer";
import PostCard from "@/features/groups/components/PostCard";
import PostCommentsModal from "@/features/groups/components/PostCommentsModal";
import SubmitReportSheet from "@/features/moderation/components/SubmitReportSheet";

import type { GroupReference } from "@/features/groups/types/groupMembership.types";
import type { Post } from "@/features/groups/types/post.types";

import { getApiErrorMessage } from "@/services/api/apiError";

function getGroupReferenceId(reference: GroupReference): string | null {
  if (typeof reference === "string") {
    return reference;
  }

  return reference.id ?? reference._id ?? null;
}

export default function UserGroupsFeedScreen() {
  const { user } = useAuth();

  const [joinedGroups, setJoinedGroups] = useState<ComposerGroupOption[]>([]);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittingPost, setSubmittingPost] = useState(false);

  const [search, setSearch] = useState("");
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<
    string | null
  >(null);

  // The post currently being reported (holds id + group)
  const [reportingPost, setReportingPost] = useState<Post | null>(null);

  const loadData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setError(null);

      const [membershipsResponse, feedResponse] = await Promise.all([
        groupMembershipApi.getMyJoinedGroups(),
        postApi.listMyFeed(),
      ]);

      const groups: ComposerGroupOption[] = [];

      (membershipsResponse.data.memberships ?? []).forEach((membership) => {
        if (membership.status !== "ACTIVE") {
          return;
        }

        const groupRef = membership.group;

        if (typeof groupRef === "string") {
          return;
        }

        const id = groupRef.id ?? groupRef._id;
        const name = groupRef.name;

        if (id && name) {
          groups.push({ id, name });
        }
      });

      setJoinedGroups(groups);
      setPosts(feedResponse.data.posts ?? []);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();

      return undefined;
    }, [loadData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    void loadData(false);
  };

  const normalizedSearch = search.trim().toLowerCase();

  const matchingGroups = useMemo(() => {
    if (!normalizedSearch) {
      return [];
    }

    return joinedGroups.filter((group) =>
      group.name.toLowerCase().includes(normalizedSearch)
    );
  }, [joinedGroups, normalizedSearch]);

  const visitGroup = (groupId: string) => {
    setSearch("");

    router.push({
      pathname: "/(app)/user/group/[groupId]/posts" as Href,
      params: { groupId },
    });
  };

  const handleCreatePost = async (
    content: string,
    isAnonymous: boolean,
    groupId?: string
  ) => {
    if (!groupId) {
      return;
    }

    try {
      setSubmittingPost(true);

      const response = await postApi.createPost(groupId, {
        content,
        isAnonymous,
      });

      const groupName = joinedGroups.find(
        (group) => group.id === groupId
      )?.name;

      setPosts((previous) => [
        { ...response.data.post, groupName },
        ...previous,
      ]);
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
      void loadData(false);
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
        <Text style={styles.headerTitle}>Groups</Text>

        <Pressable
          onPress={() => router.push("/(app)/user/discover" as Href)}
          style={styles.discoverButton}
        >
          <Ionicons name="compass-outline" size={16} color="#4f46e5" />

          <Text style={styles.discoverButtonText}>Discover</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={19} color="#94a3b8" />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search your groups to visit..."
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
          />

          {search.length > 0 && (
            <Pressable hitSlop={10} onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={19} color="#94a3b8" />
            </Pressable>
          )}
        </View>

        {normalizedSearch.length > 0 && (
          <View style={styles.searchResults}>
            {matchingGroups.length === 0 ? (
              <Text style={styles.searchResultsEmpty}>
                No joined groups match "{search}".
              </Text>
            ) : (
              matchingGroups.map((group) => (
                <Pressable
                  key={group.id}
                  onPress={() => visitGroup(group.id)}
                  style={styles.searchResultRow}
                >
                  <View style={styles.searchResultIcon}>
                    <Ionicons name="people" size={18} color="#4f46e5" />
                  </View>

                  <Text style={styles.searchResultName}>{group.name}</Text>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#94a3b8"
                  />
                </Pressable>
              ))
            )}
          </View>
        )}

        {joinedGroups.length > 0 && (
          <CreatePostComposer
            currentUserName={user?.fullName}
            submitting={submittingPost}
            groupOptions={joinedGroups}
            onSubmit={(content, isAnonymous, groupId) =>
              void handleCreatePost(content, isAnonymous, groupId)
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

            <Text style={styles.loadingText}>Loading your feed...</Text>
          </View>
        ) : joinedGroups.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons name="people-outline" size={30} color="#4f46e5" />
            </View>

            <Text style={styles.emptyTitle}>No groups joined yet</Text>

            <Text style={styles.emptyDescription}>
              Discover a support group to join and start seeing posts here.
            </Text>

            <Pressable
              onPress={() => router.push("/(app)/user/discover" as Href)}
              style={styles.emptyDiscoverButton}
            >
              <Ionicons name="compass-outline" size={17} color="#ffffff" />

              <Text style={styles.emptyDiscoverButtonText}>
                Discover Groups
              </Text>
            </Pressable>
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
              Be the first to share something with your groups.
            </Text>
          </View>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user?.id}
              canModerate={false}
              onToggleLike={() => void handleToggleLike(post.id)}
              onOpenComments={() => setActiveCommentsPostId(post.id)}
              onDelete={() => handleDeletePost(post.id)}
              onReport={() => setReportingPost(post)}
            />
          ))
        )}
      </ScrollView>

      <PostCommentsModal
        postId={activeCommentsPostId}
        visible={activeCommentsPostId !== null}
        currentUserId={user?.id}
        canModerate={false}
        onClose={() => setActiveCommentsPostId(null)}
      />

      {reportingPost ? (
        <SubmitReportSheet
          visible={reportingPost !== null}
          onClose={() => setReportingPost(null)}
          group={reportingPost.group}
          targetType="POST"
          targetId={reportingPost.id}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  header: {
    minHeight: 56,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
  },

  discoverButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#c7d2fe",
    backgroundColor: "#eef2ff",
  },

  discoverButtonText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "700",
    color: "#4f46e5",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },

  searchBox: {
    minHeight: 46,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#0f172a",
  },

  searchResults: {
    marginTop: 8,
    padding: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },

  searchResultsEmpty: {
    padding: 10,
    fontSize: 13,
    color: "#94a3b8",
  },

  searchResultRow: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  searchResultIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#eef2ff",
  },

  searchResultName: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },

  errorBox: {
    marginTop: 14,
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
    marginTop: 14,
    paddingVertical: 44,
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

  emptyDiscoverButton: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#4f46e5",
  },

  emptyDiscoverButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
