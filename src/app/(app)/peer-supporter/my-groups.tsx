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

export default function PeerSupporterMyGroupsScreen() {
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
    useState<string | null>(null);

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

          /*
           * IMPORTANT:
           *
           * Peer Supporter does NOT use
           * normal User membership APIs here.
           *
           * This endpoint returns only groups
           * assigned by the Administrator.
           */
          const response =
            await groupApi.getMyAssignedGroups();

          const assignedGroups =
            Array.isArray(
              response.data.groups
            )
              ? response.data.groups
              : [];

          setGroups(
            assignedGroups
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
        (group) => {
          const searchableText =
            [
              group.name,
              group.category,
              group.description,
              group.communityLocation ??
                "",
            ]
              .join(" ")
              .toLowerCase();

          return searchableText.includes(
            query
          );
        }
      );
    }, [
      groups,
      search,
    ]);

  const handleRefresh =
    () => {
      setRefreshing(true);

      void loadGroups(
        false
      );
    };

  const handleViewRequests =
    (
      groupId: string
    ) => {
      router.push({
        pathname:
          "/(app)/peer-supporter/join-requests",

        params: {
          groupId,
        },
      });
    };

  const handleViewPosts =
    (
      groupId: string
    ) => {
      router.push({
        pathname:
          "/(app)/peer-supporter/group/[groupId]/posts",

        params: {
          groupId,
        },
      });
    };

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
        style={{
          flex: 1,
        }}
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          themeStyles.content
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              handleRefresh
            }
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
            My Groups
          </Text>

          <Text
            style={
              themeStyles.headingDescription
            }
          >
            View the support
            groups assigned to
            you by an
            Administrator.
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
              name="heart-outline"
              size={25}
              color={themeTone("#0E7C86", "color")}
            />
          </View>

          <View
            style={
              themeStyles.summaryContent
            }
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
            placeholder="Search assigned groups..."
            placeholderTextColor={themeTone("#8BA3AB", "placeholderTextColor")}
            style={
              themeStyles.searchInput
            }
          />

          {search.length >
            0 && (
            <Pressable
              hitSlop={10}
              onPress={() =>
                setSearch("")
              }
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={themeTone("#8BA3AB", "color")}
              />
            </Pressable>
          )}
        </View>

        {error && (
          <View
            style={
              themeStyles.errorBox
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={themeTone("#b91c1c", "color")}
            />

            <View
              style={
                themeStyles.errorContent
              }
            >
              <Text
                style={
                  themeStyles.errorText
                }
              >
                {error}
              </Text>

              <Pressable
                onPress={() =>
                  void loadGroups()
                }
              >
                <Text
                  style={
                    themeStyles.retryText
                  }
                >
                  Try Again
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {loading ? (
          <View
            style={
              themeStyles.loadingArea
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
              Loading assigned
              groups...
            </Text>
          </View>
        ) : filteredGroups.length ===
          0 ? (
          <View
            style={
              themeStyles.emptyCard
            }
          >
            <View
              style={
                themeStyles.emptyIcon
              }
            >
              <Ionicons
                name="people-outline"
                size={30}
                color={themeTone("#8BA3AB", "color")}
              />
            </View>

            <Text
              style={
                themeStyles.emptyTitle
              }
            >
              {search
                ? "No groups found"
                : "No groups assigned"}
            </Text>

            <Text
              style={
                themeStyles.emptyDescription
              }
            >
              {search
                ? "No assigned groups match your search."
                : "An Administrator must assign you to a support group first."}
            </Text>
          </View>
        ) : (
          <View
            style={
              themeStyles.groupList
            }
          >
            {filteredGroups.map(
              (group) => (
                <GroupCard
                  key={
                    group.id
                  }
                  group={
                    group
                  }
                  onViewRequests={() =>
                    handleViewRequests(
                      group.id
                    )
                  }
                  onViewPosts={() =>
                    handleViewPosts(
                      group.id
                    )
                  }
                />
              )
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function GroupCard({
  group,
  onViewRequests,
  onViewPosts,
}: {
  group: SupportGroup;

  onViewRequests: () => void;
  onViewPosts: () => void;
}) {
  const themeStyles = useThemedStyles(styles);
  const themeTone = useThemeTone();

  const peerSupporterCount =
    group.peerSupporters
      ?.length ?? 0;

  const moderatorCount =
    group.moderators
      ?.length ?? 0;

  return (
    <View
      style={
        themeStyles.groupCard
      }
    >
      <View
        style={
          themeStyles.cardHeader
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
          style={
            themeStyles.groupTitleArea
          }
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
            {group.category}
          </Text>
        </View>

        <View
          style={
            themeStyles.activeBadge
          }
        >
          <Text
            style={
              themeStyles.activeText
            }
          >
            ACTIVE
          </Text>
        </View>
      </View>

      <Text
        numberOfLines={3}
        style={
          themeStyles.description
        }
      >
        {group.description}
      </Text>

      {group.communityLocation && (
        <View
          style={
            themeStyles.locationRow
          }
        >
          <Ionicons
            name="location-outline"
            size={16}
            color={themeTone("#64808C", "color")}
          />

          <Text
            style={
              themeStyles.locationText
            }
          >
            {
              group.communityLocation
            }
          </Text>
        </View>
      )}

      <View
        style={
          themeStyles.staffSection
        }
      >
        <View
          style={
            themeStyles.staffItem
          }
        >
          <Ionicons
            name="heart-outline"
            size={17}
            color={themeTone("#168994", "color")}
          />

          <Text
            style={
              themeStyles.staffText
            }
          >
            {peerSupporterCount}{" "}
            Peer Supporter
            {peerSupporterCount ===
            1
              ? ""
              : "s"}
          </Text>
        </View>

        <View
          style={
            themeStyles.staffItem
          }
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={17}
            color={themeTone("#168994", "color")}
          />

          <Text
            style={
              themeStyles.staffText
            }
          >
            {moderatorCount}{" "}
            Moderator
            {moderatorCount ===
            1
              ? ""
              : "s"}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={
          onViewRequests
        }
        style={({
          pressed,
        }) => [
          themeStyles.requestsButton,

          pressed && {
            opacity: 0.82,
          },
        ]}
      >
        <View
          style={
            themeStyles.requestsButtonIcon
          }
        >
          <Ionicons
            name="person-add-outline"
            size={18}
            color={themeTone("#0E7C86", "color")}
          />
        </View>

        <View
          style={
            themeStyles.requestsButtonContent
          }
        >
          <Text
            style={
              themeStyles.requestsButtonTitle
            }
          >
            Join Requests
          </Text>

          <Text
            style={
              themeStyles.requestsButtonDescription
            }
          >
            Review requests for
            this group
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={19}
          color={themeTone("#168994", "color")}
        />
      </Pressable>

      <Pressable
        onPress={
          onViewPosts
        }
        style={({
          pressed,
        }) => [
          themeStyles.requestsButton,
          { marginTop: 10 },

          pressed && {
            opacity: 0.82,
          },
        ]}
      >
        <View
          style={
            themeStyles.requestsButtonIcon
          }
        >
          <Ionicons
            name="chatbubbles-outline"
            size={18}
            color={themeTone("#0E7C86", "color")}
          />
        </View>

        <View
          style={
            themeStyles.requestsButtonContent
          }
        >
          <Text
            style={
              themeStyles.requestsButtonTitle
            }
          >
            Posts
          </Text>

          <Text
            style={
              themeStyles.requestsButtonDescription
            }
          >
            View and moderate posts
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={19}
          color={themeTone("#168994", "color")}
        />
      </Pressable>
    </View>
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

      paddingBottom:
        120,
    },

    headingArea: {
      paddingRight: 56,
    },

    heading: {
      fontSize: 28,

      fontWeight:
        "800",

      color:
        "#0E2A47",
    },

    headingDescription: {
      marginTop: 6,

      fontSize: 14,

      lineHeight: 21,

      color:
        "#64808C",
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
      width: 52,

      height: 52,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 17,

      backgroundColor:
        "#EAF8F5",
    },

    summaryContent: {
      flex: 1,

      marginLeft: 13,
    },

    summaryLabel: {
      fontSize: 13,

      color:
        "#64808C",
    },

    summaryValue: {
      marginTop: 2,

      fontSize: 27,

      fontWeight:
        "800",

      color:
        "#0E2A47",
    },

    searchBox: {
      minHeight: 52,

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

      fontSize: 15,

      color:
        "#0E2A47",
    },

    errorBox: {
      marginTop: 16,

      padding: 14,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      borderWidth: 1,

      borderColor:
        "#fecaca",

      borderRadius: 15,

      backgroundColor:
        "#fef2f2",
    },

    errorContent: {
      flex: 1,

      marginLeft: 8,
    },

    errorText: {
      fontSize: 14,

      lineHeight: 20,

      color:
        "#b91c1c",
    },

    retryText: {
      marginTop: 8,

      fontWeight:
        "700",

      color:
        "#0E7C86",
    },

    loadingArea: {
      paddingVertical:
        90,

      alignItems:
        "center",
    },

    loadingText: {
      marginTop: 12,

      color:
        "#64808C",
    },

    emptyCard: {
      marginTop: 22,

      paddingVertical:
        50,

      paddingHorizontal:
        22,

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        "#E0EDEB",

      borderRadius: 20,

      backgroundColor:
        "#ffffff",
    },

    emptyIcon: {
      width: 62,

      height: 62,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 31,

      backgroundColor:
        "#EDF5F4",
    },

    emptyTitle: {
      marginTop: 13,

      fontSize: 17,

      fontWeight:
        "700",

      color:
        "#4D6C78",
    },

    emptyDescription: {
      marginTop: 6,

      maxWidth: 280,

      textAlign:
        "center",

      fontSize: 12,

      lineHeight: 18,

      color:
        "#8BA3AB",
    },

    groupList: {
      marginTop: 18,
    },

    groupCard: {
      marginBottom: 14,

      padding: 17,

      borderWidth: 1,

      borderColor:
        "#E0EDEB",

      borderRadius: 20,

      backgroundColor:
        "#ffffff",
    },

    cardHeader: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",
    },

    groupIcon: {
      width: 46,

      height: 46,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 15,

      backgroundColor:
        "#EAF8F5",
    },

    groupTitleArea: {
      flex: 1,

      marginLeft: 11,

      paddingRight: 6,
    },

    groupName: {
      fontSize: 17,

      fontWeight:
        "800",

      color:
        "#0E2A47",
    },

    category: {
      marginTop: 3,

      fontSize: 12,

      fontWeight:
        "600",

      color:
        "#168994",
    },

    activeBadge: {
      paddingHorizontal:
        8,

      paddingVertical: 5,

      borderRadius: 999,

      backgroundColor:
        "#ecfdf5",
    },

    activeText: {
      fontSize: 10,

      fontWeight:
        "800",

      color:
        "#047857",
    },

    description: {
      marginTop: 14,

      fontSize: 14,

      lineHeight: 21,

      color:
        "#4D6C78",
    },

    locationRow: {
      marginTop: 10,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    locationText: {
      marginLeft: 5,

      fontSize: 12,

      color:
        "#64808C",
    },

    staffSection: {
      marginTop: 14,

      paddingTop: 13,

      flexDirection:
        "row",

      borderTopWidth: 1,

      borderTopColor:
        "#EDF5F4",
    },

    staffItem: {
      flex: 1,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    staffText: {
      marginLeft: 5,

      fontSize: 11,

      color:
        "#64808C",
    },

    requestsButton: {
      minHeight: 58,

      marginTop: 15,

      paddingHorizontal:
        12,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        "#B7E7DA",

      borderRadius: 14,

      backgroundColor:
        "#EAF8F5",
    },

    requestsButtonIcon: {
      width: 38,

      height: 38,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 12,

      backgroundColor:
        "#ffffff",
    },

    requestsButtonContent: {
      flex: 1,

      marginLeft: 10,
    },

    requestsButtonTitle: {
      fontSize: 13,

      fontWeight:
        "800",

      color:
        "#0E7C86",
    },

    requestsButtonDescription: {
      marginTop: 2,

      fontSize: 10,

      color:
        "#64808C",
    },
  });