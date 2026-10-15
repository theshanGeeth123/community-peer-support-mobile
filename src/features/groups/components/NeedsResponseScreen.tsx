import { useThemeTone, useThemedStyles } from '@/theme/useAlyvenAppearance';
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

import { router, useFocusEffect } from "expo-router";

import { useAuth } from "@/features/auth/hooks/useAuth";

import { postApi } from "@/features/groups/api/post.api";

import type {
  Post,
  PostReactionType,
} from "@/features/groups/types/post.types";

import { getApiErrorMessage } from "@/services/api/apiError";

import LanguageButton from "@/features/language/components/LanguageButton";

import PostCard from "./PostCard";
import PostCommentsModal from "./PostCommentsModal";

const PAGE_SIZE = 20;

/*
|--------------------------------------------------------------------------
| NEEDS A RESPONSE QUEUE
|--------------------------------------------------------------------------
|
| For peer supporters, moderators and admins. Shows, across the groups
| they are assigned to:
|   1. open crisis alerts
|   2. posts nobody has replied to yet (oldest first)
|
| Replying to a post removes it from the queue on the next refresh.
|
*/

export default function NeedsResponseScreen() {
  const themeStyles = useThemedStyles(styles);
  const themeTone = useThemeTone();

  const { user } = useAuth();

  const [crisisAlerts, setCrisisAlerts] = useState<Post[]>([]);
  const [unanswered, setUnanswered] = useState<Post[]>([]);
  const [counts, setCounts] = useState({
    crisisAlerts: 0,
    unanswered: 0,
  });
  const [maxAgeDays, setMaxAgeDays] = useState(14);

  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeCommentsPostId, setActiveCommentsPostId] =
    useState<string | null>(null);

  const loadQueue = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setError(null);

      const response =
        await postApi.getNeedsResponseQueue({
          limit: PAGE_SIZE,
        });

      setCrisisAlerts(
        response.data.crisisAlerts
      );
      setUnanswered(
        response.data.unanswered
      );
      setCounts(response.data.counts);
      setMaxAgeDays(
        response.data.maxAgeDays
      );
      setPage(1);
      setHasNextPage(
        response.data.pagination.hasNextPage
      );
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError)
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadQueue();

      return undefined;
    }, [loadQueue])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    void loadQueue(false);
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasNextPage) {
      return;
    }

    try {
      setLoadingMore(true);

      const nextPage = page + 1;

      const response =
        await postApi.getNeedsResponseQueue({
          page: nextPage,
          limit: PAGE_SIZE,
        });

      setUnanswered((previous) => {
        const knownIds = new Set(
          previous.map((post) => post.id)
        );

        return [
          ...previous,
          ...response.data.unanswered.filter(
            (post) => !knownIds.has(post.id)
          ),
        ];
      });

      setPage(nextPage);
      setHasNextPage(
        response.data.pagination.hasNextPage
      );
    } catch (requestError) {
      Alert.alert(
        "Unable to load more",
        getApiErrorMessage(requestError)
      );
    } finally {
      setLoadingMore(false);
    }
  };

  /*
   * Applies a change to a post in whichever section it is in.
   */
  const updatePost = (
    postId: string,
    update: (post: Post) => Post
  ) => {
    const apply = (posts: Post[]) =>
      posts.map((post) =>
        post.id === postId
          ? update(post)
          : post
      );

    setCrisisAlerts(apply);
    setUnanswered(apply);
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
    updatePost(postId, (post) => {
      const currentReaction =
        post.myReaction;

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
      if (
        currentReaction === reactionType
      ) {
        updatedCounts[reactionType] =
          Math.max(
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
        updatedCounts[currentReaction] =
          Math.max(
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
    });

    try {
      const response =
        await postApi.toggleReaction(
          postId,
          reactionType
        );

      /*
       * Backend response is authoritative.
       */
      updatePost(postId, (post) => ({
        ...post,
        myReaction:
          response.data.myReaction,
        reactionCounts:
          response.data.reactionCounts,
      }));
    } catch (requestError) {
      Alert.alert(
        "Unable to update reaction",
        getApiErrorMessage(requestError)
      );

      /*
       * Restore the actual server state if the request failed.
       */
      void loadQueue(false);
    }
  };

  const handleMarkCrisisHandled = async (
    postId: string
  ) => {
    try {
      await postApi.markCrisisHandled(
        postId
      );

      /*
       * The post leaves the crisis section. If nobody has replied,
       * it now shows up under "Waiting for a reply".
       */
      void loadQueue(false);
    } catch (requestError) {
      Alert.alert(
        "Unable to update crisis alert",
        getApiErrorMessage(requestError)
      );
    }
  };

  const handleDeletePost = (
    postId: string
  ) => {
    Alert.alert(
      "Delete post",
      "Are you sure you want to delete this post?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            void confirmDeletePost(postId),
        },
      ]
    );
  };

  const confirmDeletePost = async (
    postId: string
  ) => {
    try {
      await postApi.deletePost(postId);

      void loadQueue(false);
    } catch (requestError) {
      Alert.alert(
        "Unable to delete post",
        getApiErrorMessage(requestError)
      );
    }
  };

  const handleCloseComments = () => {
    setActiveCommentsPostId(null);

    /*
     * Posts that just got a reply drop out of the queue.
     */
    void loadQueue(false);
  };

  const renderPost = (post: Post) => (
    <PostCard
      key={post.id}
      post={post}
      currentUserId={user?.id}
      canModerate
      onToggleReaction={(reactionType) =>
        void handleToggleReaction(
          post.id,
          reactionType
        )
      }
      onOpenComments={() =>
        setActiveCommentsPostId(post.id)
      }
      onDelete={() =>
        handleDeletePost(post.id)
      }
      onMarkCrisisHandled={() =>
        void handleMarkCrisisHandled(
          post.id
        )
      }
    />
  );

  const isQueueEmpty =
    crisisAlerts.length === 0 &&
    unanswered.length === 0;

  return (
    <SafeAreaView
      style={themeStyles.safeArea}
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      <View style={themeStyles.header}>
        <Pressable
          onPress={() => router.back()}
          style={themeStyles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={themeTone("#0E2A47", "color")}
          />
        </Pressable>

        <Text style={themeStyles.headerTitle}>
          Needs a response
        </Text>

        <LanguageButton />
      </View>

      <ScrollView
        contentContainerStyle={
          themeStyles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        {error && (
          <View style={themeStyles.errorBox}>
            <Text style={themeStyles.errorText}>
              {error}
            </Text>
          </View>
        )}

        {loading ? (
          <View style={themeStyles.center}>
            <ActivityIndicator
              size="large"
              color={themeTone("#0E7C86", "color")}
            />

            <Text style={themeStyles.loadingText}>
              Loading queue...
            </Text>
          </View>
        ) : isQueueEmpty && !error ? (
          <View style={themeStyles.emptyCard}>
            <View style={themeStyles.emptyIcon}>
              <Ionicons
                name="checkmark-done-outline"
                size={30}
                color={themeTone("#16a34a", "color")}
              />
            </View>

            <Text style={themeStyles.emptyTitle}>
              All caught up
            </Text>

            <Text
              style={
                themeStyles.emptyDescription
              }
            >
              No crisis alerts, and every
              post from the last{" "}
              {maxAgeDays} days in your
              groups has a reply.
            </Text>
          </View>
        ) : (
          <>
            {/* CRISIS ALERTS */}

            {crisisAlerts.length > 0 && (
              <View style={themeStyles.section}>
                <View
                  style={
                    themeStyles.sectionHeader
                  }
                >
                  <Ionicons
                    name="warning"
                    size={18}
                    color={themeTone("#be123c", "color")}
                  />

                  <Text
                    style={[
                      themeStyles.sectionTitle,
                      themeStyles.crisisTitle,
                    ]}
                  >
                    Crisis alerts
                  </Text>

                  <View
                    style={[
                      themeStyles.countBadge,
                      themeStyles.crisisBadge,
                    ]}
                  >
                    <Text
                      style={
                        themeStyles.countBadgeText
                      }
                    >
                      {counts.crisisAlerts}
                    </Text>
                  </View>
                </View>

                <Text
                  style={themeStyles.sectionHint}
                >
                  These posts may show a risk
                  of self-harm. Please reach
                  out first, then mark them as
                  handled.
                </Text>

                {crisisAlerts.map(
                  renderPost
                )}
              </View>
            )}

            {/* WAITING FOR A REPLY */}

            <View style={themeStyles.section}>
              <View
                style={themeStyles.sectionHeader}
              >
                <Ionicons
                  name="chatbubble-ellipses"
                  size={18}
                  color={themeTone("#0E7C86", "color")}
                />

                <Text
                  style={themeStyles.sectionTitle}
                >
                  Waiting for a reply
                </Text>

                <View
                  style={themeStyles.countBadge}
                >
                  <Text
                    style={
                      themeStyles.countBadgeText
                    }
                  >
                    {counts.unanswered}
                  </Text>
                </View>
              </View>

              <Text
                style={themeStyles.sectionHint}
              >
                Posts with no comments from
                the last {maxAgeDays} days —
                longest waiting first.
              </Text>

              {unanswered.length === 0 ? (
                <Text
                  style={themeStyles.sectionEmpty}
                >
                  Every recent post has at
                  least one reply.
                </Text>
              ) : (
                unanswered.map(renderPost)
              )}

              {hasNextPage && (
                <Pressable
                  disabled={loadingMore}
                  onPress={() =>
                    void handleLoadMore()
                  }
                  style={
                    themeStyles.loadMoreButton
                  }
                >
                  {loadingMore ? (
                    <ActivityIndicator
                      size="small"
                      color={themeTone("#0E7C86", "color")}
                    />
                  ) : (
                    <Text
                      style={
                        themeStyles.loadMoreText
                      }
                    >
                      Load more
                    </Text>
                  )}
                </Pressable>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <PostCommentsModal
        postId={activeCommentsPostId}
        postContent={
          [
            ...crisisAlerts,
            ...unanswered,
          ].find(
            (post) =>
              post.id === activeCommentsPostId
          )?.content ?? null
        }
        visible={
          activeCommentsPostId !== null
        }
        currentUserId={user?.id}
        canModerate
        onClose={handleCloseComments}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5FAF9",
  },

  header: {
    height: 62,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0EDEB",
    backgroundColor: "#ffffff",
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#EDF5F4",
  },

  headerTitle: {
    flex: 1,
    marginHorizontal: 10,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "800",
    color: "#0E2A47",
  },

  content: {
    padding: 20,
    paddingBottom: 70,
  },

  section: {
    marginBottom: 26,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  sectionTitle: {
    marginLeft: 7,
    fontSize: 16,
    fontWeight: "800",
    color: "#0E2A47",
  },

  crisisTitle: {
    color: "#be123c",
  },

  countBadge: {
    marginLeft: 8,
    minWidth: 24,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: "#0E7C86",
  },

  crisisBadge: {
    backgroundColor: "#be123c",
  },

  countBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#ffffff",
  },

  sectionHint: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 17,
    color: "#64808C",
  },

  sectionEmpty: {
    marginTop: 14,
    fontSize: 13,
    color: "#8BA3AB",
  },

  loadMoreButton: {
    marginTop: 16,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#EAF8F5",
  },

  loadMoreText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0E7C86",
  },

  errorBox: {
    marginBottom: 15,
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
    color: "#64808C",
  },

  emptyCard: {
    marginTop: 20,
    paddingVertical: 50,
    paddingHorizontal: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0EDEB",
    borderRadius: 20,
    backgroundColor: "#ffffff",
  },

  emptyIcon: {
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 31,
    backgroundColor: "#f0fdf4",
  },

  emptyTitle: {
    marginTop: 13,
    fontSize: 17,
    fontWeight: "700",
    color: "#4D6C78",
  },

  emptyDescription: {
    marginTop: 6,
    maxWidth: 280,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    color: "#8BA3AB",
  },
});