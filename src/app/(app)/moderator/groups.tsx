import { useThemeTone, useThemedStyles } from '@/theme/useAlyvenAppearance';
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
  const themeStyles = useThemedStyles(styles);
  const themeTone = useThemeTone();

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
        themeStyles.safeArea
      }
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      <ScrollView
        contentContainerStyle={
          themeStyles.content
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
            themeStyles.headingArea
          }
        >
          <Text
            style={
              themeStyles.heading
            }
          >
            Moderated Groups
          </Text>

          <Text
            style={
              themeStyles.description
            }
          >
            View groups assigned
            to you and manage
            member safety.
          </Text>
        </View>

        <View
          style={
            themeStyles.summaryCard
          }
        >
          <View
            style={
              themeStyles.summaryIcon
            }
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={25}
              color={themeTone("#0E7C86", "color")}
            />
          </View>

          <View
            style={{
              marginLeft: 12,
            }}
          >
            <Text
              style={
                themeStyles.summaryLabel
              }
            >
              Assigned Groups
            </Text>

            <Text
              style={
                themeStyles.summaryValue
              }
            >
              {groups.length}
            </Text>
          </View>
        </View>

        <View
          style={
            themeStyles.searchBox
          }
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={themeTone("#8BA3AB", "color")}
          />

          <TextInput
            value={search}
            onChangeText={
              setSearch
            }
            placeholder="Search groups..."
            placeholderTextColor={themeTone("#8BA3AB", "placeholderTextColor")}
            style={
              themeStyles.searchInput
            }
          />
        </View>

        {error && (
          <View
            style={
              themeStyles.errorBox
            }
          >
            <Text
              style={
                themeStyles.errorText
              }
            >
              {error}
            </Text>
          </View>
        )}

        {loading ? (
          <View
            style={
              themeStyles.center
            }
          >
            <ActivityIndicator
              size="large"
              color={themeTone("#0E7C86", "color")}
            />

            <Text
              style={
                themeStyles.loadingText
              }
            >
              Loading groups...
            </Text>
          </View>
        ) : filteredGroups.length ===
          0 ? (
          <View
            style={
              themeStyles.emptyCard
            }
          >
            <Ionicons
              name="shield-outline"
              size={34}
              color={themeTone("#8BA3AB", "color")}
            />

            <Text
              style={
                themeStyles.emptyTitle
              }
            >
              No groups assigned
            </Text>

            <Text
              style={
                themeStyles.emptyText
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
                  themeStyles.groupCard
                }
              >
                <View
                  style={
                    themeStyles.cardTop
                  }
                >
                  <View
                    style={
                      themeStyles.groupIcon
                    }
                  >
                    <Ionicons
                      name="people"
                      size={23}
                      color={themeTone("#0E7C86", "color")}
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
                        themeStyles.groupName
                      }
                    >
                      {group.name}
                    </Text>

                    <Text
                      style={
                        themeStyles.category
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
                    themeStyles.groupDescription
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
                        "/(app)/moderator/group/[groupId]/members",

                      params: {
                        groupId:
                          group.id,
                      },
                    })
                  }
                  style={
                    themeStyles.manageButton
                  }
                >
                  <Ionicons
                    name="people-circle-outline"
                    size={20}
                    color={themeTone("#0E7C86", "color")}
                  />

                  <Text
                    style={
                      themeStyles.manageButtonText
                    }
                  >
                    Manage Members
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={19}
                    color={themeTone("#168994", "color")}
                  />
                </Pressable>

                <Pressable
                  onPress={() =>
                    router.push({
                      pathname:
                        "/(app)/moderator/group/[groupId]/posts",

                      params: {
                        groupId:
                          group.id,
                      },
                    })
                  }
                  style={[
                    themeStyles.manageButton,
                    { marginTop: 10 },
                  ]}
                >
                  <Ionicons
                    name="chatbubbles-outline"
                    size={20}
                    color={themeTone("#0E7C86", "color")}
                  />

                  <Text
                    style={
                      themeStyles.manageButtonText
                    }
                  >
                    View Posts
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={19}
                    color={themeTone("#168994", "color")}
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
        "#F5FAF9",
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
      color: "#0E2A47",
    },

    description: {
      marginTop: 6,
      lineHeight: 21,
      color: "#64808C",
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
        "#E0EDEB",
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
        "#EAF8F5",
    },

    summaryLabel: {
      fontSize: 12,
      color: "#64808C",
    },

    summaryValue: {
      marginTop: 2,
      fontSize: 25,
      fontWeight: "800",
      color: "#0E2A47",
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
        "#E0EDEB",
      borderRadius: 16,
      backgroundColor:
        "#ffffff",
    },

    searchInput: {
      flex: 1,
      marginLeft: 9,
      color: "#0E2A47",
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
      color: "#64808C",
    },

    emptyCard: {
      marginTop: 22,
      paddingVertical: 50,
      alignItems:
        "center",
      borderWidth: 1,
      borderColor:
        "#E0EDEB",
      borderRadius: 20,
      backgroundColor:
        "#ffffff",
    },

    emptyTitle: {
      marginTop: 10,
      fontWeight: "700",
      color: "#4D6C78",
    },

    emptyText: {
      marginTop: 5,
      color: "#8BA3AB",
    },

    groupCard: {
      marginTop: 15,
      padding: 17,
      borderWidth: 1,
      borderColor:
        "#E0EDEB",
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
        "#EAF8F5",
    },

    groupName: {
      fontSize: 17,
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
      marginTop: 13,
      lineHeight: 20,
      color: "#4D6C78",
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
        "#B7E7DA",
      borderRadius: 13,
      backgroundColor:
        "#EAF8F5",
    },

    manageButtonText: {
      flex: 1,
      marginLeft: 8,
      fontWeight: "700",
      color: "#0E7C86",
    },
  });