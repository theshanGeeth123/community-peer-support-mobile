import { useCallback, useState } from "react";

import { Pressable, Text, View } from "react-native";

import { type Href, router, useFocusEffect } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import { postApi } from "@/features/groups/api/post.api";

/*
 * Home "Quick Actions" card for group staff. Shows how many posts
 * are waiting, and highlights open crisis alerts in red.
 */
export default function NeedsResponseQuickAction({
  href,
  className = "",
}: {
  href: Href;
  className?: string;
}) {
  const [counts, setCounts] = useState<{
    crisisAlerts: number;
    unanswered: number;
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      postApi
        .getNeedsResponseQueue({ limit: 1 })
        .then((response) => {
          if (!cancelled) {
            setCounts(response.data.counts);
          }
        })
        .catch(() => {
          /*
           * The card still works without counts.
           */
        });

      return () => {
        cancelled = true;
      };
    }, [])
  );

  const crisisCount = counts?.crisisAlerts ?? 0;
  const unansweredCount = counts?.unanswered ?? 0;
  const hasCrisis = crisisCount > 0;

  const description = !counts
    ? "Crisis alerts and posts nobody has replied to yet."
    : hasCrisis
      ? `${crisisCount} crisis ${
          crisisCount === 1 ? "alert" : "alerts"
        } · ${unansweredCount} waiting for a reply`
      : unansweredCount > 0
        ? `${unansweredCount} ${
            unansweredCount === 1 ? "post is" : "posts are"
          } waiting for a reply`
        : "All caught up — every recent post has a reply.";

  const badgeCount = crisisCount + unansweredCount;

  return (
    <Pressable
      onPress={() => router.push(href)}
      className={`flex-row items-center rounded-3xl border bg-white p-5 ${
        hasCrisis ? "border-rose-300" : "border-slate-200"
      } ${className}`}
    >
      <View
        className={`h-12 w-12 items-center justify-center rounded-2xl ${
          hasCrisis ? "bg-rose-50" : "bg-indigo-50"
        }`}
      >
        <Ionicons
          name={hasCrisis ? "warning-outline" : "chatbubble-ellipses-outline"}
          size={24}
          color={hasCrisis ? "#e11d48" : "#4f46e5"}
        />
      </View>

      <View className="ml-4 flex-1">
        <Text className="text-base font-bold text-slate-900">
          Needs a Response
        </Text>

        <Text
          className={`mt-1 text-sm leading-5 ${
            hasCrisis ? "font-semibold text-rose-600" : "text-slate-500"
          }`}
        >
          {description}
        </Text>
      </View>

      {badgeCount > 0 && (
        <View
          className={`mr-2 min-w-7 items-center rounded-full px-2 py-1 ${
            hasCrisis ? "bg-rose-600" : "bg-indigo-600"
          }`}
        >
          <Text className="text-xs font-bold text-white">
            {badgeCount > 99 ? "99+" : badgeCount}
          </Text>
        </View>
      )}

      <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
    </Pressable>
  );
}
