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
  PostReactionType,
  PostSort,
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

interface PostListFilters {
  q: string;
  sort: PostSort;
}

const SORT_OPTIONS: {
  value: PostSort;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: "newest", label: "Newest", icon: "time-outline" },
  { value: "most_supported", label: "Most supported", icon: "heart-outline" },
  {
    value: "most_discussed",
    label: "Most discussed",
    icon: "chatbubbles-outline",
  },
  { value: "unanswered", label: "Unanswered", icon: "help-circle-outline" },
];

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
  const [searchResultCount, setSearchResultCount] = useState<number | null>(
    null
  );

  const [sortOption, setSortOption] = useState<PostSort>("newest");

  /*
   * True while search/sort results are being fetched
   * (not the first load, which shows the full-screen spinner).
   */
  const [refetching, setRefetching] = useState(false);

  const isSearchActive = searchQuery.length > 0;

  /*
   * The normal feed keeps pinned posts on top. Search results and
   * other sort orders show posts exactly as the server orders them.
   */
  const isDefaultFeed = !isSearchActive && sortOption === "newest";

  const filtersRef = useRef<PostListFilters>({ q: "", sort: "newest" });
  const latestPostsRequestRef = useRef(0);
  const hasLoadedRef = useRef(false);

  /*
   * Fetches posts for the current search/sort.
   * Responses from older requests are ignored, so fast typing
   * or quick sort changes cannot show stale results.
   */
  const fetchPosts = useCallback(
    async ({ q, sort }: PostListFilters) => {
      if (!groupId) {
        return;
      }

      const requestId = ++latestPostsRequestRef.current;

      const response = await postApi.listPosts(groupId, {
        ...(q ? { q } : {}),
        ...(sort !== "newest" ? { sort } : {}),
      });

      if (requestId !== latestPostsRequestRef.current) {
        return;
      }

      const fetchedPosts = response.data.posts ?? [];
      const isDefault = !q && sort === "newest";

      setPosts(isDefault ? sortPosts(fetchedPosts) : fetchedPosts);
      setSearchResultCount(q ? response.data.pagination.totalPosts : null);
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

        await fetchPosts(filtersRef.current);

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
    const filters = { q: searchQuery, sort: sortOption };

    filtersRef.current = filters;

    /*
     * The first load is done by loadEverything.
     */
    if (!hasLoadedRef.current) {
      return;
    }

    const refetch = async () => {
      try {
        setRefetching(true);
        setError(null);

        await fetchPosts(filters);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError));
      } finally {
        setRefetching(false);
      }
    };

    void refetch();
  }, [searchQuery, sortOption, fetchPosts]);

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

  const handleCreatePost = async (
    payload: CreatePostPayload
  ): Promise<boolean> => {
    if (!groupId) {
      return false;
    }

    try {
      setSubmittingPost(true);

      const response = await postApi.createPost(groupId, payload);

      /*
       * A brand-new post belongs at the top of "Newest" and
       * "Unanswered". In the other sorts it would be out of place,
       * so switch back to Newest where the author can see it.
       */
      if (sortOption === "newest" || sortOption === "unanswered") {
        setPosts((previous) => [response.data.post, ...previous]);
      } else {
        setSortOption("newest");
      }

      if (response.data.safety?.crisisDetected) {
        setShowCrisisSupport(true);
      }

      return true;
    } catch (requestError) {
      Alert.alert("Unable to post", getApiErrorMessage(requestError));

      return false;
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

  /*
   * POST REACTIONS
   *
   * Selecting the same reaction removes it.
   * Selecting a different reaction changes the existing reaction.
   */
  const handleToggleReaction = async (
    postId: string,
    reactionType: PostReactionType
  ) => {
    /*
     * Optimistic UI update.
     */
    setPosts((previous) =>
      previous.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        const currentReaction = post.myReaction;

        const updatedCounts = {
          ...(post.reactionCounts ?? {
            like: 0,
            love: 0,
            haha: 0,
            wow: 0,
            sad: 0,
            angry: 0,
          }),
        };

        /*
         * Same reaction = remove reaction.
         */
        if (currentReaction === reactionType) {
          updatedCounts[reactionType] = Math.max(
            0,
            updatedCounts[reactionType] - 1
          );

          return {
            ...post,
            myReaction: null,
            reactionCounts: updatedCounts,
          };
        }

        /*
         * Changing from one reaction to another.
         */
        if (currentReaction) {
          updatedCounts[currentReaction] = Math.max(
            0,
            updatedCounts[currentReaction] - 1
          );
        }

        updatedCounts[reactionType] =
          updatedCounts[reactionType] + 1;

        return {
          ...post,
          myReaction: reactionType,
          reactionCounts: updatedCounts,
        };
      })
    );

    try {
      const response = await postApi.toggleReaction(
        postId,
        reactionType
      );

      /*
       * Backend response is authoritative.
       */
      setPosts((previous) =>
        previous.map((post) =>
          post.id === postId
            ? {
                ...post,
                myReaction: response.data.myReaction,
                reactionCounts: response.data.reactionCounts,
              }
            : post
        )
      );
    } catch (requestError) {
      Alert.alert(
        "Unable to update reaction",
        getApiErrorMessage(requestError)
      );

      /*
       * Restore the actual server state if the request failed.
       */
      void loadEverything(false);
    }
  };

  const handleTogglePin = async (postId: string) => {
    try {
      const response = await postApi.togglePin(postId);

      setPosts((previous) => {
        const updated = previous.map((post) =>
          post.id === postId
            ? { ...post, isPinned: response.data.isPinned }
            : post
        );

        return isDefaultFeed ? sortPosts(updated) : updated;
      });
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

          {searchText.length > 0 && (
            <Pressable hitSlop={10} onPress={clearSearch}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </Pressable>
          )}
        </View>

        {/* SORT */}

        <View style={styles.sortRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sortChips}
            keyboardShouldPersistTaps="handled"
          >
            {SORT_OPTIONS.map((option) => {
              const active = option.value === sortOption;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => setSortOption(option.value)}
                  style={[styles.sortChip, active && styles.sortChipActive]}
                >
                  <Ionicons
                    name={option.icon}
                    size={14}
                    color={active ? "#ffffff" : "#64748b"}
                  />

                  <Text
                    style={[
                      styles.sortChipText,
                      active && styles.sortChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {refetching && (
            <ActivityIndicator
              size="small"
              color="#4f46e5"
              style={styles.sortSpinner}
            />
          )}
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
            onSubmit={handleCreatePost}
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
        ) : posts.length === 0 && sortOption === "unanswered" ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="checkmark-done-outline"
                size={28}
                color="#16a34a"
              />
            </View>

            <Text style={styles.emptyTitle}>Everyone has a reply</Text>

            <Text style={styles.emptyDescription}>
              Every post in this group has at least one comment.
            </Text>
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
              onToggleReaction={(reactionType) =>
                void handleToggleReaction(post.id, reactionType)
              }
              onOpenComments={() => setActiveCommentsPostId(post.id)}
              onDelete={() => handleDeletePost(post.id)}
              onTogglePin={() => void handleTogglePin(post.id)}
              onReport={() => setReportingPostId(post.id)}
              onMarkCrisisHandled={() =>
                void handleMarkCrisisHandled(post.id)
              }
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
    marginBottom: 10,
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

  sortRow: {
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  sortChips: {
    gap: 8,
  },

  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 999,
    backgroundColor: "#ffffff",
  },

  sortChipActive: {
    borderColor: "#4f46e5",
    backgroundColor: "#4f46e5",
  },

  sortChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },

  sortChipTextActive: {
    color: "#ffffff",
  },

  sortSpinner: {
    marginLeft: 8,
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