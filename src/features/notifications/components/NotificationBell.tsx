import { useCallback, useState } from "react";

import { Pressable, StyleSheet, Text, View } from "react-native";

import { type Href, router, useFocusEffect } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import { notificationApi } from "../api/notification.api";

/*
 * Bell with an unread badge for the Home headers.
 * The count refreshes every time the screen comes into focus,
 * so it updates after returning from the notifications list.
 */
export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      notificationApi
        .getUnreadCount()
        .then((response) => {
          if (!cancelled) {
            setUnreadCount(response.data.unreadCount);
          }
        })
        .catch(() => {
          /*
           * The bell still opens the list without a count.
           */
        });

      return () => {
        cancelled = true;
      };
    }, [])
  );

  return (
    <Pressable
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={
        unreadCount > 0
          ? `Notifications, ${unreadCount} unread`
          : "Notifications"
      }
      onPress={() => router.push("/(app)/notifications" as Href)}
      style={styles.button}
    >
      <Ionicons
        name={unreadCount > 0 ? "notifications" : "notifications-outline"}
        size={23}
        color="#334155"
      />

      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    backgroundColor: "#ffffff",
  },

  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#f8fafc",
    borderRadius: 10,
    backgroundColor: "#e11d48",
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#ffffff",
  },
});
