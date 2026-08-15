import { useCallback, useMemo, useState } from "react";

import {
  ActivityIndicator,
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

import { groupApi } from "@/features/groups/api/group.api";
import { groupMembershipApi } from "@/features/groups/api/groupMembership.api";

import type { SupportGroup } from "@/features/groups/types/group.types";
import type { GroupReference } from "@/features/groups/types/groupMembership.types";

import { getApiErrorMessage } from "@/services/api/apiError";

function getGroupReferenceId(reference: GroupReference): string | null {
  if (typeof reference === "string") {
    return reference;
  }

  return reference.id ?? reference._id ?? null;
}

export default function DiscoverGroupsScreen() {
  const [groups, setGroups] = useState<SupportGroup[]>([]);
  const [joinedGroupIds, setJoinedGroupIds] = useState<Set<string>>(
    new Set()
  );

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setError(null);

      const [groupsResponse, membershipsResponse] = await Promise.all([
        groupApi.getGroups({ page: 1, limit: 100 }),
        groupMembershipApi.getMyJoinedGroups(),
      ]);

      setGroups(
        Array.isArray(groupsResponse.data.groups)
          ? groupsResponse.data.groups
          : []
      );

      const ids = new Set<string>();

      (membershipsResponse.data.memberships ?? []).forEach((membership) => {
        if (membership.status !== "ACTIVE") {
          return;
        }

        const groupId = getGroupReferenceId(membership.group);

        if (groupId) {
          ids.add(groupId);
        }
      });

      setJoinedGroupIds(ids);
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

  const normalizedSearch = search.trim().toLowerCase();

  const discoverableGroups = useMemo(() => {
    return groups
      .filter((group) => !joinedGroupIds.has(group.id))
      .filter((group) => {
        if (!normalizedSearch) {
          return true;
        }

        const searchable = [
          group.name,
          group.category,
          group.description,
          group.communityLocation ?? "",
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(normalizedSearch);
      });
  }, [groups, joinedGroupIds, normalizedSearch]);

  const handleRefresh = () => {
    setRefreshing(true);
    void loadData(false);
  };

  const openGroup = (groupId: string) => {
    router.push({
      pathname: "/(app)/user/group/[groupId]" as Href,
      params: { groupId },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
        </Pressable>

        <Text style={styles.headerTitle}>Discover Groups</Text>

        <View style={{ width: 42 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#94a3b8" />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search groups to join..."
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
          />

          {search.length > 0 && (
            <Pressable hitSlop={10} onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </Pressable>
          )}
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>

            <Pressable onPress={() => void loadData()}>
              <Text style={styles.retryText}>Try Again</Text>
            </Pressable>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingArea}>
            <ActivityIndicator size="large" color="#4f46e5" />

            <Text style={styles.loadingText}>Loading groups...</Text>
          </View>
        ) : discoverableGroups.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="compass-outline" size={30} color="#94a3b8" />

            <Text style={styles.emptyTitle}>
              {search ? "No groups found" : "You're in every group already"}
            </Text>

            <Text style={styles.emptyDescription}>
              {search
                ? "Try another search term."
                : "Check back later for new support groups."}
            </Text>
          </View>
        ) : (
          discoverableGroups.map((group) => (
            <Pressable
              key={group.id}
              onPress={() => openGroup(group.id)}
              style={({ pressed }) => [
                styles.groupCard,
                pressed && { opacity: 0.85 },
              ]}
            >
              <View style={styles.cardTop}>
                <View style={styles.groupIcon}>
                  <Ionicons name="people" size={23} color="#4f46e5" />
                </View>

                <View style={styles.groupTitleArea}>
                  <Text style={styles.groupName}>{group.name}</Text>

                  <Text style={styles.category}>{group.category}</Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </View>

              <Text numberOfLines={2} style={styles.groupDescription}>
                {group.description}
              </Text>
            </Pressable>
          ))
        )}
      </ScrollView>
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
    textAlign: "center",
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
  },

  content: {
    padding: 20,
    paddingBottom: 100,
  },

  searchBox: {
    minHeight: 50,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },

  searchInput: {
    flex: 1,
    marginLeft: 9,
    fontSize: 15,
    color: "#0f172a",
  },

  errorBox: {
    marginTop: 15,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
  },

  errorText: {
    lineHeight: 19,
    color: "#b91c1c",
  },

  retryText: {
    marginTop: 8,
    fontWeight: "700",
    color: "#4f46e5",
  },

  loadingArea: {
    paddingVertical: 90,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#64748b",
  },

  emptyCard: {
    marginTop: 22,
    paddingVertical: 50,
    paddingHorizontal: 22,
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },

  emptyTitle: {
    marginTop: 13,
    fontSize: 16,
    fontWeight: "700",
    color: "#475569",
  },

  emptyDescription: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    color: "#94a3b8",
  },

  groupCard: {
    marginTop: 14,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  groupIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#eef2ff",
  },

  groupTitleArea: {
    flex: 1,
    marginLeft: 11,
    paddingRight: 5,
  },

  groupName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },

  category: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "600",
    color: "#6366f1",
  },

  groupDescription: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 19,
    color: "#475569",
  },
});
