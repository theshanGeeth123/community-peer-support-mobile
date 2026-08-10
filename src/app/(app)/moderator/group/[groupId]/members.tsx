import {
    useCallback,
    useMemo,
    useState,
} from "react";

import {
    ActivityIndicator,
    Alert,
    Pressable,
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
    useLocalSearchParams,
} from "expo-router";

import {
    groupMembershipApi,
} from "@/features/groups/api/groupMembership.api";

import type {
    GroupMembership,
    JoinRequestUser,
} from "@/features/groups/types/groupMembership.types";

import {
    getApiErrorMessage,
} from "@/services/api/apiError";

export default function ModeratorMembersScreen() {
  const params =
    useLocalSearchParams();

  const rawGroupId =
    params.groupId;

  const groupId =
    Array.isArray(
      rawGroupId
    )
      ? rawGroupId[0]
      : rawGroupId;

  const [
    groupName,
    setGroupName,
  ] =
    useState(
      "Group Members"
    );

  const [
    memberships,
    setMemberships,
  ] =
    useState<
      GroupMembership[]
    >([]);

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
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    processingId,
    setProcessingId,
  ] =
    useState<string | null>(
      null
    );

  const loadMembers =
    useCallback(
      async () => {
        if (!groupId) {
          return;
        }

        try {
          setLoading(true);
          setError(null);

          const response =
            await groupMembershipApi.getModeratorGroupMembers(
              groupId
            );

          setGroupName(
            response.data.group
              .name
          );

          setMemberships(
            response.data
              .memberships ??
              []
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
        }
      },
      [groupId]
    );

  useFocusEffect(
    useCallback(() => {
      void loadMembers();

      return undefined;
    }, [loadMembers])
  );

  const filteredMemberships =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return memberships;
      }

      return memberships.filter(
        (membership) => {
          const user =
            getUser(
              membership.user
            );

          return `${user.fullName} ${user.email}`
            .toLowerCase()
            .includes(query);
        }
      );
    }, [
      memberships,
      search,
    ]);

  const askForReason = (
    membership: GroupMembership,
    action:
      | "SUSPEND"
      | "REMOVE"
  ) => {
    const user =
      getUser(
        membership.user
      );

    Alert.prompt(
      action === "SUSPEND"
        ? "Suspend Member"
        : "Remove Member",

      `Enter a reason for ${action.toLowerCase()}ing ${user.fullName}.`,

      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text:
            action ===
            "SUSPEND"
              ? "Suspend"
              : "Remove",

          style:
            "destructive",

          onPress: (
            value
          ) => {
            const reason =
              value?.trim() ??
              "";

            if (
              reason.length <
              5
            ) {
              Alert.alert(
                "Reason Required",
                "Please enter at least 5 characters."
              );

              return;
            }

            void moderateMembership(
              membership,
              action,
              reason
            );
          },
        },
      ],

      "plain-text"
    );
  };

  const moderateMembership =
    async (
      membership: GroupMembership,
      action:
        | "SUSPEND"
        | "REMOVE",
      reason: string
    ) => {
      try {
        setProcessingId(
          membership.id
        );

        if (
          action ===
          "SUSPEND"
        ) {
          await groupMembershipApi.suspendMembership(
            membership.id,
            {
              reason,
            }
          );
        } else {
          await groupMembershipApi.removeMembership(
            membership.id,
            {
              reason,
            }
          );
        }

        await loadMembers();
      } catch (
        requestError
      ) {
        Alert.alert(
          "Action Failed",
          getApiErrorMessage(
            requestError
          )
        );
      } finally {
        setProcessingId(
          null
        );
      }
    };

  const reactivateMembership =
    async (
      membership: GroupMembership
    ) => {
      try {
        setProcessingId(
          membership.id
        );

        await groupMembershipApi.reactivateMembership(
          membership.id,
          {
            reason:
              "Membership reactivated by Moderator",
          }
        );

        await loadMembers();
      } catch (
        requestError
      ) {
        Alert.alert(
          "Action Failed",
          getApiErrorMessage(
            requestError
          )
        );
      } finally {
        setProcessingId(
          null
        );
      }
    };

  return (
    <SafeAreaView
      style={
        styles.safeArea
      }
    >
      <View
        style={
          styles.header
        }
      >
        <Pressable
          onPress={() =>
            router.back()
          }
          style={
            styles.backButton
          }
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#0f172a"
          />
        </Pressable>

        <View
          style={{
            flex: 1,
            marginLeft: 10,
          }}
        >
          <Text
            numberOfLines={1}
            style={
              styles.title
            }
          >
            {groupName}
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Member Management
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
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
            placeholder="Search members..."
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
          </View>
        ) : filteredMemberships.length ===
          0 ? (
          <View
            style={
              styles.emptyCard
            }
          >
            <Ionicons
              name="people-outline"
              size={34}
              color="#94a3b8"
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              No members found
            </Text>
          </View>
        ) : (
          filteredMemberships.map(
            (
              membership
            ) => {
              const user =
                getUser(
                  membership.user
                );

              const processing =
                processingId ===
                membership.id;

              return (
                <View
                  key={
                    membership.id
                  }
                  style={
                    styles.memberCard
                  }
                >
                  <View
                    style={
                      styles.memberTop
                    }
                  >
                    <View
                      style={
                        styles.avatar
                      }
                    >
                      <Text
                        style={
                          styles.avatarText
                        }
                      >
                        {getInitials(
                          user.fullName
                        )}
                      </Text>
                    </View>

                    <View
                      style={{
                        flex: 1,
                        marginLeft:
                          10,
                      }}
                    >
                      <Text
                        style={
                          styles.memberName
                        }
                      >
                        {
                          user.fullName
                        }
                      </Text>

                      <Text
                        style={
                          styles.memberEmail
                        }
                      >
                        {
                          user.email
                        }
                      </Text>
                    </View>

                    <StatusBadge
                      status={
                        membership.status
                      }
                    />
                  </View>

                  {membership.statusReason && (
                    <View
                      style={
                        styles.reasonBox
                      }
                    >
                      <Text
                        style={
                          styles.reasonLabel
                        }
                      >
                        Latest reason
                      </Text>

                      <Text
                        style={
                          styles.reasonText
                        }
                      >
                        {
                          membership.statusReason
                        }
                      </Text>
                    </View>
                  )}

                  {processing ? (
                    <View
                      style={
                        styles.processingArea
                      }
                    >
                      <ActivityIndicator
                        color="#4f46e5"
                      />
                    </View>
                  ) : membership.status ===
                    "ACTIVE" ? (
                    <View
                      style={
                        styles.actions
                      }
                    >
                      <Pressable
                        onPress={() =>
                          askForReason(
                            membership,
                            "SUSPEND"
                          )
                        }
                        style={
                          styles.suspendButton
                        }
                      >
                        <Text
                          style={
                            styles.suspendText
                          }
                        >
                          Suspend
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() =>
                          askForReason(
                            membership,
                            "REMOVE"
                          )
                        }
                        style={
                          styles.removeButton
                        }
                      >
                        <Text
                          style={
                            styles.removeText
                          }
                        >
                          Remove
                        </Text>
                      </Pressable>
                    </View>
                  ) : membership.status ===
                    "SUSPENDED" ? (
                    <View
                      style={
                        styles.actions
                      }
                    >
                      <Pressable
                        onPress={() =>
                          void reactivateMembership(
                            membership
                          )
                        }
                        style={
                          styles.reactivateButton
                        }
                      >
                        <Text
                          style={
                            styles.reactivateText
                          }
                        >
                          Reactivate
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() =>
                          askForReason(
                            membership,
                            "REMOVE"
                          )
                        }
                        style={
                          styles.removeButton
                        }
                      >
                        <Text
                          style={
                            styles.removeText
                          }
                        >
                          Remove
                        </Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              );
            }
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatusBadge({
  status,
}: {
  status:
    | "ACTIVE"
    | "SUSPENDED"
    | "REMOVED";
}) {
  const config = {
    ACTIVE: {
      bg: "#ecfdf5",
      text: "#047857",
    },

    SUSPENDED: {
      bg: "#fff7ed",
      text: "#c2410c",
    },

    REMOVED: {
      bg: "#fef2f2",
      text: "#b91c1c",
    },
  }[status];

  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor:
            config.bg,
        },
      ]}
    >
      <Text
        style={{
          fontSize: 10,
          fontWeight: "800",
          color:
            config.text,
        }}
      >
        {status}
      </Text>
    </View>
  );
}

function getUser(
  user:
    | string
    | JoinRequestUser
) {
  if (
    typeof user ===
    "string"
  ) {
    return {
      fullName: "User",
      email: user,
    };
  }

  return {
    fullName:
      user.fullName ??
      "User",

    email:
      user.email ??
      "",
  };
}

function getInitials(
  name: string
) {
  const parts =
    name
      .trim()
      .split(/\s+/);

  if (
    parts.length === 1
  ) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${
    parts[
      parts.length - 1
    ][0]
  }`.toUpperCase();
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        "#f8fafc",
    },

    header: {
      minHeight: 64,
      paddingHorizontal:
        16,
      flexDirection:
        "row",
      alignItems:
        "center",
      borderBottomWidth: 1,
      borderBottomColor:
        "#e2e8f0",
      backgroundColor:
        "#ffffff",
    },

    backButton: {
      width: 42,
      height: 42,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderRadius: 14,
      backgroundColor:
        "#f1f5f9",
    },

    title: {
      fontSize: 17,
      fontWeight: "800",
      color: "#0f172a",
    },

    subtitle: {
      marginTop: 2,
      fontSize: 11,
      color: "#64748b",
    },

    content: {
      padding: 20,
      paddingBottom: 80,
    },

    searchBox: {
      minHeight: 50,
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

    emptyCard: {
      marginTop: 20,
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

    memberCard: {
      marginTop: 14,
      padding: 16,
      borderWidth: 1,
      borderColor:
        "#e2e8f0",
      borderRadius: 18,
      backgroundColor:
        "#ffffff",
    },

    memberTop: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    avatar: {
      width: 44,
      height: 44,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderRadius: 22,
      backgroundColor:
        "#eef2ff",
    },

    avatarText: {
      fontWeight: "800",
      color: "#4f46e5",
    },

    memberName: {
      fontWeight: "800",
      color: "#0f172a",
    },

    memberEmail: {
      marginTop: 3,
      fontSize: 11,
      color: "#64748b",
    },

    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 999,
    },

    reasonBox: {
      marginTop: 13,
      padding: 11,
      borderRadius: 12,
      backgroundColor:
        "#f8fafc",
    },

    reasonLabel: {
      fontSize: 10,
      fontWeight: "700",
      color: "#64748b",
    },

    reasonText: {
      marginTop: 4,
      lineHeight: 18,
      color: "#475569",
    },

    actions: {
      marginTop: 14,
      flexDirection:
        "row",
      gap: 10,
    },

    suspendButton: {
      flex: 1,
      minHeight: 43,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderWidth: 1,
      borderColor:
        "#fed7aa",
      borderRadius: 12,
      backgroundColor:
        "#fff7ed",
    },

    suspendText: {
      fontWeight: "700",
      color: "#c2410c",
    },

    removeButton: {
      flex: 1,
      minHeight: 43,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderWidth: 1,
      borderColor:
        "#fecaca",
      borderRadius: 12,
      backgroundColor:
        "#fef2f2",
    },

    removeText: {
      fontWeight: "700",
      color: "#b91c1c",
    },

    reactivateButton: {
      flex: 1,
      minHeight: 43,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderWidth: 1,
      borderColor:
        "#a7f3d0",
      borderRadius: 12,
      backgroundColor:
        "#ecfdf5",
    },

    reactivateText: {
      fontWeight: "700",
      color: "#047857",
    },

    processingArea: {
      marginTop: 14,
      paddingVertical: 10,
      alignItems:
        "center",
    },
  });