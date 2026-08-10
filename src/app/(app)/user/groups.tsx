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

import {
  groupMembershipApi,
} from "@/features/groups/api/groupMembership.api";

import type {
  SupportGroup,
} from "@/features/groups/types/group.types";

import type {
  GroupJoinRequest,
  GroupMembership,
  GroupReference,
  JoinRequestStatus,
} from "@/features/groups/types/groupMembership.types";

import {
  getApiErrorMessage,
} from "@/services/api/apiError";

export default function UserGroupsScreen() {
  const [
    groups,
    setGroups,
  ] =
    useState<SupportGroup[]>(
      []
    );

  const [
    joinRequests,
    setJoinRequests,
  ] =
    useState<GroupJoinRequest[]>(
      []
    );

  const [
    memberships,
    setMemberships,
  ] =
    useState<GroupMembership[]>(
      []
    );

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

  const loadData =
    useCallback(
      async (
        showLoading = true
      ) => {
        try {
          if (showLoading) {
            setLoading(
              true
            );
          }

          setError(null);

          const [
            groupsResponse,
            requestsResponse,
            membershipsResponse,
          ] =
            await Promise.all([
              groupApi.getGroups(
                {
                  page: 1,
                  limit: 100,
                }
              ),

              groupMembershipApi.getMyJoinRequests(),

              groupMembershipApi.getMyJoinedGroups(),
            ]);

          setGroups(
            Array.isArray(
              groupsResponse
                .data.groups
            )
              ? groupsResponse
                  .data.groups
              : []
          );

          setJoinRequests(
            Array.isArray(
              requestsResponse
                .data.requests
            )
              ? requestsResponse
                  .data.requests
              : []
          );

          setMemberships(
            Array.isArray(
              membershipsResponse
                .data
                .memberships
            )
              ? membershipsResponse
                  .data
                  .memberships
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
          setLoading(
            false
          );

          setRefreshing(
            false
          );
        }
      },
      []
    );

  useFocusEffect(
    useCallback(() => {
      void loadData();

      return undefined;
    }, [loadData])
  );

  const joinedGroupIds =
    useMemo(() => {
      const ids =
        new Set<string>();

      memberships.forEach(
        (membership) => {
          if (
            membership.status !==
            "ACTIVE"
          ) {
            return;
          }

          const groupId =
            getGroupReferenceId(
              membership.group
            );

          if (groupId) {
            ids.add(
              groupId
            );
          }
        }
      );

      return ids;
    }, [memberships]);

  const latestRequestByGroup =
    useMemo(() => {
      const map =
        new Map<
          string,
          GroupJoinRequest
        >();

      joinRequests.forEach(
        (request) => {
          const groupId =
            getGroupReferenceId(
              request.group
            );

          if (
            groupId &&
            !map.has(
              groupId
            )
          ) {
            map.set(
              groupId,
              request
            );
          }
        }
      );

      return map;
    }, [joinRequests]);

  const normalizedSearch =
    search
      .trim()
      .toLowerCase();

  const filteredGroups =
    useMemo(() => {
      if (
        !normalizedSearch
      ) {
        return groups;
      }

      return groups.filter(
        (group) => {
          const searchable =
            [
              group.name,
              group.category,
              group.description,
              group.communityLocation ??
                "",
            ]
              .join(" ")
              .toLowerCase();

          return searchable.includes(
            normalizedSearch
          );
        }
      );
    }, [
      groups,
      normalizedSearch,
    ]);

  const myGroups =
    filteredGroups.filter(
      (group) =>
        joinedGroupIds.has(
          group.id
        )
    );

  const availableGroups =
    filteredGroups.filter(
      (group) =>
        !joinedGroupIds.has(
          group.id
        )
    );

  const handleRefresh =
    () => {
      setRefreshing(
        true
      );

      void loadData(false);
    };

  const openGroup =
    (
      groupId: string
    ) => {
      router.push({
        pathname:
          "/(app)/user/group/[groupId]" as Href,

        params: {
          groupId,
        },
      });
    };

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
        style={{
          flex: 1,
        }}
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
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
            styles.headingArea
          }
        >
          <Text
            style={
              styles.heading
            }
          >
            Support Groups
          </Text>

          <Text
            style={
              styles.headingDescription
            }
          >
            Find a supportive
            community, request to
            join, and connect once
            approved.
          </Text>
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
                color="#94a3b8"
              />
            </Pressable>
          )}
        </View>

        {error && (
          <View
            style={
              styles.errorBox
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color="#b91c1c"
            />

            <View
              style={{
                flex: 1,
                marginLeft: 8,
              }}
            >
              <Text
                style={
                  styles.errorText
                }
              >
                {error}
              </Text>

              <Pressable
                onPress={() =>
                  void loadData()
                }
              >
                <Text
                  style={
                    styles.retryText
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
              styles.loadingArea
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
              Loading support
              groups...
            </Text>
          </View>
        ) : (
          <>
            <SectionHeader
              title="My Groups"
              count={
                myGroups.length
              }
            />

            {myGroups.length ===
            0 ? (
              <View
                style={
                  styles.smallEmptyCard
                }
              >
                <Ionicons
                  name="people-outline"
                  size={25}
                  color="#94a3b8"
                />

                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  No joined groups
                  yet
                </Text>

                <Text
                  style={
                    styles.emptyDescription
                  }
                >
                  Groups approved
                  by a Peer
                  Supporter will
                  appear here.
                </Text>
              </View>
            ) : (
              myGroups.map(
                (group) => (
                  <GroupCard
                    key={
                      group.id
                    }
                    group={
                      group
                    }
                    membershipActive
                    request={
                      latestRequestByGroup.get(
                        group.id
                      )
                    }
                    onPress={() =>
                      openGroup(
                        group.id
                      )
                    }
                  />
                )
              )
            )}

            <SectionHeader
              title="Available Groups"
              count={
                availableGroups.length
              }
            />

            {availableGroups.length ===
            0 ? (
              <View
                style={
                  styles.smallEmptyCard
                }
              >
                <Ionicons
                  name="search-outline"
                  size={25}
                  color="#94a3b8"
                />

                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  No groups found
                </Text>

                <Text
                  style={
                    styles.emptyDescription
                  }
                >
                  Try another
                  search or refresh
                  the page.
                </Text>
              </View>
            ) : (
              availableGroups.map(
                (group) => (
                  <GroupCard
                    key={
                      group.id
                    }
                    group={
                      group
                    }
                    request={
                      latestRequestByGroup.get(
                        group.id
                      )
                    }
                    onPress={() =>
                      openGroup(
                        group.id
                      )
                    }
                  />
                )
              )
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({
  title,
  count,
}: {
  title: string;
  count: number;
}) {
  return (
    <View
      style={
        styles.sectionHeader
      }
    >
      <Text
        style={
          styles.sectionTitle
        }
      >
        {title}
      </Text>

      <View
        style={
          styles.countBadge
        }
      >
        <Text
          style={
            styles.countText
          }
        >
          {count}
        </Text>
      </View>
    </View>
  );
}

function GroupCard({
  group,
  request,
  membershipActive = false,
  onPress,
}: {
  group: SupportGroup;

  request?:
    | GroupJoinRequest
    | undefined;

  membershipActive?: boolean;

  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({
        pressed,
      }) => [
        styles.groupCard,

        pressed &&
          styles.pressedCard,
      ]}
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
          style={
            styles.groupTitleArea
          }
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
            {group.category}
          </Text>
        </View>

        {membershipActive ? (
          <StatusBadge
            status="APPROVED"
            label="Joined"
          />
        ) : request ? (
          <StatusBadge
            status={
              request.status
            }
          />
        ) : null}
      </View>

      <Text
        numberOfLines={3}
        style={
          styles.groupDescription
        }
      >
        {group.description}
      </Text>

      {group.communityLocation && (
        <View
          style={
            styles.locationRow
          }
        >
          <Ionicons
            name="location-outline"
            size={16}
            color="#64748b"
          />

          <Text
            style={
              styles.locationText
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
          styles.cardBottom
        }
      >
        <View
          style={
            styles.staffInfo
          }
        >
          <Ionicons
            name="heart-outline"
            size={17}
            color="#6366f1"
          />

          <Text
            style={
              styles.staffInfoText
            }
          >
            {
              group
                .peerSupporters
                .length
            }{" "}
            Peer Supporter
            {group
              .peerSupporters
              .length === 1
              ? ""
              : "s"}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color="#94a3b8"
        />
      </View>
    </Pressable>
  );
}

function StatusBadge({
  status,
  label,
}: {
  status: JoinRequestStatus;
  label?: string;
}) {
  const config = {
    PENDING: {
      background:
        "#fff7ed",

      text:
        "#c2410c",

      icon:
        "time-outline" as const,
    },

    APPROVED: {
      background:
        "#ecfdf5",

      text:
        "#047857",

      icon:
        "checkmark-circle-outline" as const,
    },

    REJECTED: {
      background:
        "#fef2f2",

      text:
        "#b91c1c",

      icon:
        "close-circle-outline" as const,
    },
  }[status];

  return (
    <View
      style={[
        styles.statusBadge,

        {
          backgroundColor:
            config.background,
        },
      ]}
    >
      <Ionicons
        name={
          config.icon
        }
        size={13}
        color={
          config.text
        }
      />

      <Text
        style={[
          styles.statusText,

          {
            color:
              config.text,
          },
        ]}
      >
        {label ??
          formatStatus(
            status
          )}
      </Text>
    </View>
  );
}

function getGroupReferenceId(
  reference: GroupReference
): string | null {
  if (
    typeof reference ===
    "string"
  ) {
    return reference;
  }

  return (
    reference.id ??
    reference._id ??
    null
  );
}

function formatStatus(
  status: JoinRequestStatus
) {
  if (
    status === "PENDING"
  ) {
    return "Pending";
  }

  if (
    status === "APPROVED"
  ) {
    return "Approved";
  }

  return "Rejected";
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

    headingDescription: {
      marginTop: 6,
      fontSize: 14,
      lineHeight: 21,
      color: "#64748b",
    },

    searchBox: {
      minHeight: 50,

      marginTop: 20,

      paddingHorizontal:
        14,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderRadius: 16,

      borderWidth: 1,

      borderColor:
        "#e2e8f0",

      backgroundColor:
        "#ffffff",
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

      flexDirection:
        "row",

      borderRadius: 14,

      borderWidth: 1,

      borderColor:
        "#fecaca",

      backgroundColor:
        "#fef2f2",
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
      alignItems:
        "center",
    },

    loadingText: {
      marginTop: 12,
      color: "#64748b",
    },

    sectionHeader: {
      marginTop: 26,

      marginBottom: 12,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    sectionTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: "#0f172a",
    },

    countBadge: {
      minWidth: 27,

      height: 27,

      marginLeft: 8,

      paddingHorizontal: 7,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 14,

      backgroundColor:
        "#eef2ff",
    },

    countText: {
      fontSize: 12,
      fontWeight: "800",
      color: "#4f46e5",
    },

    smallEmptyCard: {
      paddingVertical: 30,

      paddingHorizontal:
        20,

      alignItems:
        "center",

      borderRadius: 18,

      borderWidth: 1,

      borderColor:
        "#e2e8f0",

      backgroundColor:
        "#ffffff",
    },

    emptyTitle: {
      marginTop: 9,
      fontWeight: "700",
      color: "#475569",
    },

    emptyDescription: {
      marginTop: 5,

      textAlign: "center",

      fontSize: 12,

      lineHeight: 18,

      color: "#94a3b8",
    },

    groupCard: {
      marginBottom: 13,

      padding: 16,

      borderRadius: 20,

      borderWidth: 1,

      borderColor:
        "#e2e8f0",

      backgroundColor:
        "#ffffff",
    },

    pressedCard: {
      opacity: 0.82,
    },

    cardTop: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",
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
      marginTop: 13,

      fontSize: 14,

      lineHeight: 20,

      color: "#475569",
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
      color: "#64748b",
    },

    cardBottom: {
      marginTop: 14,

      paddingTop: 13,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderTopWidth: 1,

      borderTopColor:
        "#f1f5f9",
    },

    staffInfo: {
      flex: 1,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    staffInfoText: {
      marginLeft: 5,
      fontSize: 11,
      color: "#64748b",
    },

    statusBadge: {
      paddingHorizontal: 8,

      paddingVertical: 5,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderRadius: 999,
    },

    statusText: {
      marginLeft: 3,
      fontSize: 10,
      fontWeight: "800",
    },
  });