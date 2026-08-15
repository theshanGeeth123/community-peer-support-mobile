import {
  useCallback,
  useMemo,
  useState,
} from "react";

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

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  router,
  useFocusEffect,
  type Href,
} from "expo-router";

import {
  groupApi,
} from "@/features/groups/api/group.api";

import type {
  SupportGroup,
} from "@/features/groups/types/group.types";

import {
  getApiErrorMessage,
} from "@/services/api/apiError";

export default function ModeratorGroupsScreen() {
  const [
    groups,
    setGroups,
  ] =
    useState<SupportGroup[]>([]);

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const loadGroups =
    useCallback(
      async (
        showLoading = true
      ) => {
        try {
          if (showLoading) {
            setLoading(true);
          }

          setError(null);

          const response =
            await groupApi.getMyAssignedGroups();

          setGroups(
            Array.isArray(
              response.data.groups
            )
              ? response.data.groups
              : []
          );
        } catch (
          requestError
        ) {
          setError(
            getApiErrorMessage(
              requestError
            )
          );
        } finally {
          setLoading(false);

          setRefreshing(
            false
          );
        }
      },
      []
    );

  useFocusEffect(
    useCallback(() => {
      void loadGroups();

      return undefined;
    }, [loadGroups])
  );

  const filteredGroups =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return groups;
      }

      return groups.filter(
        (group) =>
          [
            group.name,
            group.category,
            group.description,
            group.communityLocation ??
              "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(query)
      );
    }, [
      groups,
      search,
    ]);

  return (
    <SafeAreaView
      style={
        styles.safeArea
      }
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={() => {
              setRefreshing(
                true
              );

              void loadGroups(
                false
              );
            }}
          />
        }
      >
        <View
          style={
            styles.headingArea
          }
        >
          <Text
            style={
              styles.heading
            }
          >
            Moderated Groups
          </Text>

          <Text
            style={
              styles.description
            }
          >
            View groups assigned
            to you and manage
            member safety.
          </Text>
        </View>

        <View
          style={
            styles.summaryCard
          }
        >
          <View
            style={
              styles.summaryIcon
            }
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={25}
              color="#4f46e5"
            />
          </View>

          <View
            style={{
              marginLeft: 12,
            }}
          >
            <Text
              style={
                styles.summaryLabel
              }
            >
              Assigned Groups
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {groups.length}
            </Text>
          </View>
        </View>

        <View
          style={
            styles.searchBox
          }
        >
          <Ionicons
            name="search-outline"
            size={20}
            color="#94a3b8"
          />

          <TextInput
            value={search}
            onChangeText={
              setSearch
            }
            placeholder="Search groups..."
            placeholderTextColor="#94a3b8"
            style={
              styles.searchInput
            }
          />
        </View>

        {error && (
          <View
            style={
              styles.errorBox
            }
          >
            <Text
              style={
                styles.errorText
              }
            >
              {error}
            </Text>
          </View>
        )}

        {loading ? (
          <View
            style={
              styles.center
            }
          >
            <ActivityIndicator
              size="large"
              color="#4f46e5"
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Loading groups...
            </Text>
          </View>
        ) : filteredGroups.length ===
          0 ? (
          <View
            style={
              styles.emptyCard
            }
          >
            <Ionicons
              name="shield-outline"
              size={34}
              color="#94a3b8"
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              No groups assigned
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              An Administrator
              must assign you to
              a group first.
            </Text>
          </View>
        ) : (
          filteredGroups.map(
            (group) => (
              <View
                key={
                  group.id
                }
                style={
                  styles.groupCard
                }
              >
                <View
                  style={
                    styles.cardTop
                  }
                >
                  <View
                    style={
                      styles.groupIcon
                    }
                  >
                    <Ionicons
                      name="people"
                      size={23}
                      color="#4f46e5"
                    />
                  </View>

                  <View
                    style={{
                      flex: 1,
                      marginLeft: 11,
                    }}
                  >
                    <Text
                      style={
                        styles.groupName
                      }
                    >
                      {group.name}
                    </Text>

                    <Text
                      style={
                        styles.category
                      }
                    >
                      {
                        group.category
                      }
                    </Text>
                  </View>
                </View>

                <Text
                  numberOfLines={3}
                  style={
                    styles.groupDescription
                  }
                >
                  {
                    group.description
                  }
                </Text>

                <Pressable
                  onPress={() =>
                    router.push({
                      pathname:
                        "/(app)/moderator/group/[groupId]/members" as Href,

                      params: {
                        groupId:
                          group.id,
                      },
                    })
                  }
                  style={
                    styles.manageButton
                  }
                >
                  <Ionicons
                    name="people-circle-outline"
                    size={20}
                    color="#4f46e5"
                  />

                  <Text
                    style={
                      styles.manageButtonText
                    }
                  >
                    Manage Members
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={19}
                    color="#6366f1"
                  />
                </Pressable>

                <Pressable
                  onPress={() =>
                    router.push({
                      pathname:
                        "/(app)/moderator/group/[groupId]/posts" as Href,

                      params: {
                        groupId:
                          group.id,
                      },
                    })
                  }
                  style={[
                    styles.manageButton,
                    { marginTop: 10 },
                  ]}
                >
                  <Ionicons
                    name="chatbubbles-outline"
                    size={20}
                    color="#4f46e5"
                  />

                  <Text
                    style={
                      styles.manageButtonText
                    }
                  >
                    View Posts
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={19}
                    color="#6366f1"
                  />
                </Pressable>
              </View>
            )
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        "#f8fafc",
    },

    content: {
      paddingHorizontal:
        20,
      paddingTop: 18,
      paddingBottom: 120,
    },

    headingArea: {
      paddingRight: 55,
    },

    heading: {
      fontSize: 28,
      fontWeight: "800",
      color: "#0f172a",
    },

    description: {
      marginTop: 6,
      lineHeight: 21,
      color: "#64748b",
    },

    summaryCard: {
      marginTop: 20,
      padding: 16,
      flexDirection:
        "row",
      alignItems:
        "center",
      borderWidth: 1,
      borderColor:
        "#e2e8f0",
      borderRadius: 20,
      backgroundColor:
        "#ffffff",
    },

    summaryIcon: {
      width: 50,
      height: 50,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderRadius: 16,
      backgroundColor:
        "#eef2ff",
    },

    summaryLabel: {
      fontSize: 12,
      color: "#64748b",
    },

    summaryValue: {
      marginTop: 2,
      fontSize: 25,
      fontWeight: "800",
      color: "#0f172a",
    },

    searchBox: {
      minHeight: 50,
      marginTop: 16,
      paddingHorizontal:
        14,
      flexDirection:
        "row",
      alignItems:
        "center",
      borderWidth: 1,
      borderColor:
        "#e2e8f0",
      borderRadius: 16,
      backgroundColor:
        "#ffffff",
    },

    searchInput: {
      flex: 1,
      marginLeft: 9,
      color: "#0f172a",
    },

    errorBox: {
      marginTop: 15,
      padding: 14,
      borderWidth: 1,
      borderColor:
        "#fecaca",
      borderRadius: 14,
      backgroundColor:
        "#fef2f2",
    },

    errorText: {
      color: "#b91c1c",
    },

    center: {
      paddingVertical: 80,
      alignItems:
        "center",
    },

    loadingText: {
      marginTop: 10,
      color: "#64748b",
    },

    emptyCard: {
      marginTop: 22,
      paddingVertical: 50,
      alignItems:
        "center",
      borderWidth: 1,
      borderColor:
        "#e2e8f0",
      borderRadius: 20,
      backgroundColor:
        "#ffffff",
    },

    emptyTitle: {
      marginTop: 10,
      fontWeight: "700",
      color: "#475569",
    },

    emptyText: {
      marginTop: 5,
      color: "#94a3b8",
    },

    groupCard: {
      marginTop: 15,
      padding: 17,
      borderWidth: 1,
      borderColor:
        "#e2e8f0",
      borderRadius: 20,
      backgroundColor:
        "#ffffff",
    },

    cardTop: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    groupIcon: {
      width: 44,
      height: 44,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderRadius: 14,
      backgroundColor:
        "#eef2ff",
    },

    groupName: {
      fontSize: 17,
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
      marginTop: 13,
      lineHeight: 20,
      color: "#475569",
    },

    manageButton: {
      minHeight: 48,
      marginTop: 15,
      paddingHorizontal:
        13,
      flexDirection:
        "row",
      alignItems:
        "center",
      borderWidth: 1,
      borderColor:
        "#c7d2fe",
      borderRadius: 13,
      backgroundColor:
        "#eef2ff",
    },

    manageButtonText: {
      flex: 1,
      marginLeft: 8,
      fontWeight: "700",
      color: "#4f46e5",
    },
  });