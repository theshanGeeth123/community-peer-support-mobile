import { useThemeTone, useThemedStyles } from '@/theme/useAlyvenAppearance';
import SectionBanner from "@/features/branding/components/SectionBanner";
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

import { router, useFocusEffect } from "expo-router";

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
  const themeStyles = useThemedStyles(styles);
  const themeTone = useThemeTone();

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
      pathname: "/(app)/user/group/[groupId]",
      params: { groupId },
    });
  };

  return (
    <SafeAreaView style={themeStyles.safeArea} edges={["top", "left", "right"]}>
      <View style={themeStyles.header}>
        <Pressable onPress={() => router.back()} style={themeStyles.backButton}>
          <Ionicons name="arrow-back" size={22} color={themeTone("#0E2A47", "color")} />
        </Pressable>

        <Text style={themeStyles.headerTitle}>Discover Groups</Text>

        <View style={{ width: 42 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={themeStyles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <SectionBanner
          eyebrow="FIND YOUR PEOPLE"
          title="A community for every journey."
          description="Explore supportive groups and discover where you feel a sense of belonging."
          icon="compass-outline"
        />
        <View style={themeStyles.searchBox}>
          <Ionicons name="search-outline" size={20} color={themeTone("#8BA3AB", "color")} />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search groups to join..."
            placeholderTextColor={themeTone("#8BA3AB", "placeholderTextColor")}
            style={themeStyles.searchInput}
          />

          {search.length > 0 && (
            <Pressable hitSlop={10} onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={20} color={themeTone("#8BA3AB", "color")} />
            </Pressable>
          )}
        </View>

        {error && (
          <View style={themeStyles.errorBox}>
            <Text style={themeStyles.errorText}>{error}</Text>

            <Pressable onPress={() => void loadData()}>
              <Text style={themeStyles.retryText}>Try Again</Text>
            </Pressable>
          </View>
        )}

        {loading ? (
          <View style={themeStyles.loadingArea}>
            <ActivityIndicator size="large" color={themeTone("#0E7C86", "color")} />

            <Text style={themeStyles.loadingText}>Loading groups...</Text>
          </View>
        ) : discoverableGroups.length === 0 ? (
          <View style={themeStyles.emptyCard}>
            <Ionicons name="compass-outline" size={30} color={themeTone("#8BA3AB", "color")} />

            <Text style={themeStyles.emptyTitle}>
              {search ? "No groups found" : "You're in every group already"}
            </Text>

            <Text style={themeStyles.emptyDescription}>
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
                themeStyles.groupCard,
                pressed && { opacity: 0.85 },
              ]}
            >
              <View style={themeStyles.cardTop}>
                <View style={themeStyles.groupIcon}>
                  <Ionicons name="people" size={23} color={themeTone("#0E7C86", "color")} />
                </View>

                <View style={themeStyles.groupTitleArea}>
                  <Text style={themeStyles.groupName}>{group.name}</Text>

                  <Text style={themeStyles.category}>{group.category}</Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color={themeTone("#8BA3AB", "color")} />
              </View>

              <Text numberOfLines={2} style={themeStyles.groupDescription}>
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
    textAlign: "center",
    fontSize: 17,
    fontWeight: "800",
    color: "#0E2A47",
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
    borderColor: "#E0EDEB",
    backgroundColor: "#ffffff",
  },

  searchInput: {
    flex: 1,
    marginLeft: 9,
    fontSize: 15,
    color: "#0E2A47",
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
    color: "#0E7C86",
  },

  loadingArea: {
    paddingVertical: 90,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#64808C",
  },

  emptyCard: {
    marginTop: 22,
    paddingVertical: 50,
    paddingHorizontal: 22,
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0EDEB",
    backgroundColor: "#ffffff",
  },

  emptyTitle: {
    marginTop: 13,
    fontSize: 16,
    fontWeight: "700",
    color: "#4D6C78",
  },

  emptyDescription: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    color: "#8BA3AB",
  },

  groupCard: {
    marginTop: 14,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0EDEB",
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
    backgroundColor: "#EAF8F5",
  },

  groupTitleArea: {
    flex: 1,
    marginLeft: 11,
    paddingRight: 5,
  },

  groupName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0E2A47",
  },

  category: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "600",
    color: "#168994",
  },

  groupDescription: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 19,
    color: "#4D6C78",
  },
});
