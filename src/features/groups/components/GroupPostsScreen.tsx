import { useCallback, useEffect, useRef, useState } from "react";

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

import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import { useAuth } from "@/features/auth/hooks/useAuth";

import { groupApi } from "@/features/groups/api/group.api";
import { groupMembershipApi } from "@/features/groups/api/groupMembership.api";
import { postApi } from "@/features/groups/api/post.api";

import type { SupportGroup } from "@/features/groups/types/group.types";
import type {
  CreatePostPayload,
  Post,
} from "@/features/groups/types/post.types";

import { getApiErrorMessage } from "@/services/api/apiError";

import SubmitReportSheet from "@/features/moderation/components/SubmitReportSheet";

import CreatePostComposer from "./CreatePostComposer";
import CrisisSupportModal from "./CrisisSupportModal";
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

const SEARCH_DEBOUNCE_MS = 400;

function sortPosts(posts: Post[]) {
  return [...posts].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }

    return (
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });
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

  const [reportingPostId, setReportingPostId] = useState<string | null>(null);

  const [showCrisisSupport, setShowCrisisSupport] = useState(false);

  /*
   * searchText  → what is typed in the box
   * searchQuery → trimmed text, updated after the user stops typing
   */
  const [searchText, setSearchText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResultCount, setSearchResultCount] = useState<number | null>(
    null
  );

  const isSearchActive = searchQuery.length > 0;

  const searchQueryRef = useRef("");
  const latestPostsRequestRef = useRef(0);
  const hasLoadedRef = useRef(false);

  /*
   * Fetches posts for the current search (or the normal feed).
   * Responses from older requests are ignored, so fast typing
   * cannot show stale results.
   */
  const fetchPosts = useCallback(
    async (query: string) => {
      if (!groupId) {
        return;
      }

      const requestId = ++latestPostsRequestRef.current;

      const response = await postApi.listPosts(
        groupId,
        query ? { q: query } : {}
      );

      if (requestId !== latestPostsRequestRef.current) {
        return;
      }

      const fetchedPosts = response.data.posts ?? [];

      setPosts(query ? fetchedPosts : sortPosts(fetchedPosts));
      setSearchResultCount(
        query ? response.data.pagination.totalPosts : null
      );
    },
    [groupId]
  );

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

        setCanPost(canModerate || hasActiveMembership);

        await fetchPosts(searchQueryRef.current);

        hasLoadedRef.current = true;
      } catch (requestError) {
        setError(getApiErrorMessage(requestError));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [groupId, user, fetchPosts]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchText.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchText]);

  useEffect(() => {
    searchQueryRef.current = searchQuery;

    /*
     * The first load is done by loadEverything.
     */
    if (!hasLoadedRef.current) {
      return;
    }

    const runSearch = async () => {
      try {
        setSearching(true);
        setError(null);

        await fetchPosts(searchQuery);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError));
      } finally {
        setSearching(false);
      }
    };

    void runSearch();
  }, [searchQuery, fetchPosts]);

  const clearSearch = () => {
    setSearchText("");
    setSearchQuery("");
  };

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

  const handleCreatePost = async (payload: CreatePostPayload) => {
    if (!groupId) {
      return;
    }

    try {
      setSubmittingPost(true);

      const response = await postApi.createPost(groupId, payload);

      setPosts((previous) => [response.data.post, ...previous]);

      if (response.data.safety?.crisisDetected) {
        setShowCrisisSupport(true);
      }
    } catch (requestError) {
      Alert.alert("Unable to post", getApiErrorMessage(requestError));
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleMarkCrisisHandled = async (postId: string) => {
    try {
      const response = await postApi.markCrisisHandled(postId);

      setPosts((previous) =>
        previous.map((post) =>
          post.id === postId
            ? { ...post, crisisFlag: response.data.crisisFlag }
            : post
        )
      );
    } catch (requestError) {
      Alert.alert(
        "Unable to update crisis alert",
        getApiErrorMessage(requestError)
      );
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

  const handleTogglePin = async (postId: string) => {
    try {
      const response = await postApi.togglePin(postId);

      setPosts((previous) =>
        sortPosts(
          previous.map((post) =>
            post.id === postId
              ? { ...post, isPinned: response.data.isPinned }
              : post
          )
        )
      );
    } catch (requestError) {
      Alert.alert("Unable to update pin", getApiErrorMessage(requestError));
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
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* SEARCH */}

        <View style={styles.searchBox}>
          <Ionicons name="search" size={17} color="#94a3b8" />

          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search posts in this group"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            maxLength={100}
            style={styles.searchInput}
          />

          {searching ? (
            <ActivityIndicator size="small" color="#4f46e5" />
          ) : searchText.length > 0 ? (
            <Pressable hitSlop={10} onPress={clearSearch}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </Pressable>
          ) : null}
        </View>

        {isSearchActive &&
          searchResultCount !== null &&
          searchResultCount > 0 && (
            <Text style={styles.searchSummary}>
              {`${searchResultCount} ${
                searchResultCount === 1 ? "post" : "posts"
              } found for "${searchQuery}"${
                searchResultCount > posts.length
                  ? ` · showing latest ${posts.length}`
                  : ""
              }`}
            </Text>
          )}

        {canPost && !isSearchActive && (
          <CreatePostComposer
            currentUserName={user?.fullName}
            submitting={submittingPost}
            onSubmit={(payload) => void handleCreatePost(payload)}
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
        ) : posts.length === 0 && isSearchActive ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons name="search-outline" size={27} color="#4f46e5" />
            </View>

            <Text style={styles.emptyTitle}>No matching posts</Text>

            <Text style={styles.emptyDescription}>
              Try a different word, or check the spelling.
            </Text>

            <Pressable onPress={clearSearch} style={styles.clearSearchButton}>
              <Text style={styles.clearSearchButtonText}>Clear search</Text>
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
              onTogglePin={() => void handleTogglePin(post.id)}
              onReport={() => setReportingPostId(post.id)}
              onMarkCrisisHandled={() => void handleMarkCrisisHandled(post.id)}
            />
          ))
        )}
      </ScrollView>

      <CrisisSupportModal
        visible={showCrisisSupport}
        onClose={() => setShowCrisisSupport(false)}
      />

      <PostCommentsModal
        postId={activeCommentsPostId}
        visible={activeCommentsPostId !== null}
        currentUserId={user?.id}
        canModerate={canModerateAll}
        onClose={() => setActiveCommentsPostId(null)}
      />

      {groupId && reportingPostId ? (
        <SubmitReportSheet
          visible={reportingPostId !== null}
          onClose={() => setReportingPostId(null)}
          group={groupId}
          targetType="POST"
          targetId={reportingPostId}
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

  searchBox: {
    marginBottom: 14,
    height: 46,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    backgroundColor: "#ffffff",
  },

  searchInput: {
    flex: 1,
    marginHorizontal: 9,
    fontSize: 14,
    color: "#0f172a",
  },

  searchSummary: {
    marginBottom: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },

  clearSearchButton: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#eef2ff",
  },

  clearSearchButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4f46e5",
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
