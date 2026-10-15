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
import { getRoleGroupPostsRoute } from "@/features/navigation/roleNavigation";

import { getApiErrorMessage } from "@/services/api/apiError";

import { notificationApi } from "../api/notification.api";

import type { AppNotification } from "../types/notification.types";

const PAGE_SIZE = 20;

function formatRelativeTime(isoDate: string) {
  const diffMinutes = Math.floor(
    (Date.now() - new Date(isoDate).getTime()) / (1000 * 60)
  );

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

function getActorText(notification: AppNotification) {
  const name = notification.actor?.fullName ?? "Someone";
  const others = notification.actorCount - 1;

  if (others <= 0) {
    return name;
  }

  return `${name} and ${others} ${others === 1 ? "other" : "others"}`;
}

function getNotificationText(notification: AppNotification) {
  const actor = getActorText(notification);

  switch (notification.type) {
    case "POST_LIKE":
      return `${actor} supported your post`;

    case "COMMENT_REPLY":
      return `${actor} replied to your comment`;

    case "POST_COMMENT":
    default:
      return `${actor} commented on your post`;
  }
}

const TYPE_ICON: Record<
  AppNotification["type"],
  { name: keyof typeof Ionicons.glyphMap; color: string; background: string }
> = {
  POST_LIKE: { name: "heart", color: "#e11d48", background: "#ffe4e6" },
  POST_COMMENT: { name: "chatbubble", color: "#0E7C86", background: "#D8F3EA" },
  COMMENT_REPLY: {
    name: "arrow-undo",
    color: "#0E7C86",
    background: "#cffafe",
  },
};

export default function NotificationsScreen() {
  const themeStyles = useThemedStyles(styles);
  const themeTone = useThemeTone();

  const { user } = useAuth();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setError(null);

      const response = await notificationApi.list({ limit: PAGE_SIZE });

      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
      setPage(1);
      setHasNextPage(response.data.pagination.hasNextPage);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadNotifications();

      return undefined;
    }, [loadNotifications])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    void loadNotifications(false);
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasNextPage) {
      return;
    }

    try {
      setLoadingMore(true);

      const nextPage = page + 1;

      const response = await notificationApi.list({
        page: nextPage,
        limit: PAGE_SIZE,
      });

      setNotifications((previous) => {
        const knownIds = new Set(previous.map((item) => item.id));

        return [
          ...previous,
          ...response.data.notifications.filter(
            (item) => !knownIds.has(item.id)
          ),
        ];
      });

      setPage(nextPage);
      setHasNextPage(response.data.pagination.hasNextPage);
    } catch (requestError) {
      Alert.alert("Unable to load more", getApiErrorMessage(requestError));
    } finally {
      setLoadingMore(false);
    }
  };

  const markLocallyAsRead = (notificationId: string) => {
    setNotifications((previous) =>
      previous.map((item) =>
        item.id === notificationId ? { ...item, isRead: true } : item
      )
    );

    setUnreadCount((previous) => Math.max(0, previous - 1));
  };

  const handleOpenNotification = (notification: AppNotification) => {
    if (!notification.isRead) {
      markLocallyAsRead(notification.id);

      notificationApi.markRead(notification.id).catch(() => {
        /*
         * Not critical — it will show as unread again on refresh.
         */
      });
    }

    if (!notification.post || !notification.group || !user) {
      Alert.alert(
        "Post not available",
        "This post has been removed from the group."
      );

      return;
    }

    /*
     * Open the group at this exact post. Comment and reply
     * notifications also open the post's comments.
     */
    router.push(
      getRoleGroupPostsRoute(user.role, notification.group.id, {
        postId: notification.post.id,
        openComments: notification.type !== "POST_LIKE",
      })
    );
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);

      await notificationApi.markAllRead();

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, isRead: true }))
      );

      setUnreadCount(0);
    } catch (requestError) {
      Alert.alert("Unable to update", getApiErrorMessage(requestError));
    } finally {
      setMarkingAll(false);
    }
  };

  const renderNotification = (notification: AppNotification) => {
    const icon = TYPE_ICON[notification.type] ?? TYPE_ICON.POST_COMMENT;

    const preview =
      notification.type === "POST_LIKE"
        ? notification.post?.preview
        : notification.comment?.preview ??
          (notification.post ? "(comment removed)" : null);

    return (
      <Pressable
        key={notification.id}
        accessibilityRole="button"
        accessibilityLabel={getNotificationText(notification)}
        onPress={() => handleOpenNotification(notification)}
        style={[themeStyles.item, !notification.isRead && themeStyles.itemUnread]}
      >
        <View style={[themeStyles.iconCircle, { backgroundColor: icon.background }]}>
          <Ionicons name={icon.name} size={17} color={icon.color} />
        </View>

        <View style={themeStyles.itemBody}>
          <Text
            style={[themeStyles.itemTitle, !notification.isRead && themeStyles.itemTitleUnread]}
          >
            {getNotificationText(notification)}
          </Text>

          {preview ? (
            <Text numberOfLines={2} style={themeStyles.itemPreview}>
              “{preview}”
            </Text>
          ) : null}

          <Text style={themeStyles.itemMeta}>
            {[
              notification.group?.name,
              formatRelativeTime(notification.updatedAt),
            ]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        </View>

        {!notification.isRead && <View style={themeStyles.unreadDot} />}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={themeStyles.safeArea} edges={["top", "left", "right"]}>
      <View style={themeStyles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={themeStyles.backButton}>
          <Ionicons name="arrow-back" size={22} color={themeTone("#0E2A47", "color")} />
        </Pressable>

        <Text style={themeStyles.headerTitle}>Notifications</Text>

        {unreadCount > 0 ? (
          <Pressable
            disabled={markingAll}
            accessibilityRole="button"
            accessibilityLabel="Mark all notifications as read"
            hitSlop={8}
            onPress={() => void handleMarkAllRead()}
            style={themeStyles.markAllButton}
          >
            {markingAll ? (
              <ActivityIndicator size="small" color={themeTone("#0E7C86", "color")} />
            ) : (
              <Ionicons name="checkmark-done" size={22} color={themeTone("#0E7C86", "color")} />
            )}
          </Pressable>
        ) : (
          <View style={{ width: 42 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={themeStyles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {error && (
          <View style={themeStyles.errorBox}>
            <Ionicons name="cloud-offline-outline" size={22} color={themeTone("#b91c1c", "color")} />
            <Text style={[themeStyles.errorText, { marginTop: 7 }]}>{error}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void loadNotifications()}
              style={themeStyles.retryButton}
            >
              <Text style={themeStyles.retryText}>Try again</Text>
              <Ionicons name="refresh-outline" size={15} color={themeTone("#0E7C86", "color")} />
            </Pressable>
          </View>
        )}

        {loading ? (
          <View style={themeStyles.center}>
            <ActivityIndicator size="large" color={themeTone("#0E7C86", "color")} />
          </View>
        ) : notifications.length === 0 && !error ? (
          <View style={themeStyles.emptyCard}>
            <View style={themeStyles.emptyIcon}>
              <Ionicons
                name="notifications-off-outline"
                size={28}
                color={themeTone("#0E7C86", "color")}
              />
            </View>

            <Text style={themeStyles.emptyTitle}>No notifications yet</Text>

            <Text style={themeStyles.emptyDescription}>
              When someone comments on or supports your posts, you will see
              it here.
            </Text>
          </View>
        ) : (
          <>
            <View style={themeStyles.activityHeader}>
              <View>
                <Text style={themeStyles.activityEyebrow}>STAY CONNECTED</Text>
                <Text style={themeStyles.activityTitle}>Recent activity</Text>
              </View>
              <View style={themeStyles.activityPill}>
                <Ionicons name="notifications-outline" size={15} color={themeTone("#0E7C86", "color")} />
                <Text style={themeStyles.activityPillText}>{unreadCount} unread</Text>
              </View>
            </View>
            {unreadCount > 0 && (
              <Text style={themeStyles.unreadSummary}>
                {unreadCount} unread · tap ✓✓ to mark all as read
              </Text>
            )}

            <View style={themeStyles.list}>{notifications.map(renderNotification)}</View>

            {hasNextPage && (
              <Pressable
                disabled={loadingMore}
                onPress={() => void handleLoadMore()}
                style={themeStyles.loadMoreButton}
              >
                {loadingMore ? (
                  <ActivityIndicator size="small" color={themeTone("#0E7C86", "color")} />
                ) : (
                  <Text style={themeStyles.loadMoreText}>Load more</Text>
                )}
              </Pressable>
            )}
          </>
        )}
      </ScrollView>
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

  markAllButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#EAF8F5",
  },

  content: {
    padding: 20,
    paddingBottom: 60,
  },

  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  activityEyebrow: { color: '#0E7C86', fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  activityTitle: { color: '#0E2A47', fontWeight: '900', fontSize: 22, marginTop: 5 },
  activityPill: { flexDirection: 'row', gap: 6, alignItems: 'center', borderRadius: 20, backgroundColor: '#EAF8F5', paddingHorizontal: 12, paddingVertical: 9 },
  activityPillText: { fontSize: 11, color: '#0E7C86', fontWeight: '800' },
  retryButton: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 10 },
  retryText: { color: '#0E7C86', fontWeight: '800', fontSize: 13 },
  unreadSummary: {
    marginBottom: 12,
    fontSize: 12,
    fontWeight: "600",
    color: "#64808C",
  },

  list: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0EDEB",
    borderRadius: 20,
    backgroundColor: "#ffffff",
  },

  item: {
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#EDF5F4",
  },

  itemUnread: {
    backgroundColor: "#f5f7ff",
  },

  iconCircle: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
  },

  itemBody: {
    flex: 1,
    marginLeft: 12,
  },

  itemTitle: {
    fontSize: 14,
    lineHeight: 19,
    color: "#31515F",
  },

  itemTitleUnread: {
    fontWeight: "800",
    color: "#0E2A47",
  },

  itemPreview: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: "#64808C",
  },

  itemMeta: {
    marginTop: 5,
    fontSize: 11,
    color: "#8BA3AB",
  },

  unreadDot: {
    width: 9,
    height: 9,
    marginTop: 6,
    marginLeft: 8,
    borderRadius: 5,
    backgroundColor: "#0E7C86",
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
    backgroundColor: "#EAF8F5",
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
