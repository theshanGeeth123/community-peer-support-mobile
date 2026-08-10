import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    Ionicons,
} from "@expo/vector-icons";

import {
    adminApi,
} from "@/features/admin/api/admin.api";

import type {
    AdminUser,
} from "@/features/admin/types/admin.types";

import {
    groupApi,
} from "@/features/groups/api/group.api";

import type {
    GroupUserReference,
    SupportGroup,
} from "@/features/groups/types/group.types";

import {
    getApiErrorMessage,
} from "@/services/api/apiError";

interface GroupStaffAssignmentModalProps {
  visible: boolean;

  group:
    | SupportGroup
    | null;

  onClose: () => void;

  onGroupUpdated: (
    group: SupportGroup
  ) => void;
}

type StaffRole =
  | "PEER_SUPPORTER"
  | "MODERATOR";

function isUserAssigned(
  references: GroupUserReference[],
  userId: string
) {
  return references.some(
    (reference) => {
      if (
        typeof reference ===
        "string"
      ) {
        return (
          reference === userId
        );
      }

      return (
        reference.id === userId
      );
    }
  );
}

export default function GroupStaffAssignmentModal({
  visible,
  group,
  onClose,
  onGroupUpdated,
}: GroupStaffAssignmentModalProps) {
  const [
    workingGroup,
    setWorkingGroup,
  ] =
    useState<SupportGroup | null>(
      group
    );

  const [
    peerSupporters,
    setPeerSupporters,
  ] =
    useState<AdminUser[]>([]);

  const [
    moderators,
    setModerators,
  ] =
    useState<AdminUser[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    processingKey,
    setProcessingKey,
  ] =
    useState<string | null>(
      null
    );

  useEffect(() => {
    setWorkingGroup(
      group
    );
  }, [group]);

  const loadStaff =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError(null);

          const [
            peerResponse,
            moderatorResponse,
          ] =
            await Promise.all([
              adminApi.getUsers(
                {
                  role:
                    "PEER_SUPPORTER",

                  status:
                    "ACTIVE",

                  page: 1,
                  limit: 100,
                }
              ),

              adminApi.getUsers(
                {
                  role:
                    "MODERATOR",

                  status:
                    "ACTIVE",

                  page: 1,
                  limit: 100,
                }
              ),
            ]);

          setPeerSupporters(
            Array.isArray(
              peerResponse.data
                .users
            )
              ? peerResponse.data
                  .users
              : []
          );

          setModerators(
            Array.isArray(
              moderatorResponse
                .data.users
            )
              ? moderatorResponse
                  .data.users
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
        }
      },
      []
    );

  useEffect(() => {
    if (
      visible &&
      group
    ) {
      void loadStaff();
    }
  }, [
    visible,
    group,
    loadStaff,
  ]);

  const handleToggleAssignment =
    async (
      role: StaffRole,
      user: AdminUser
    ) => {
      if (!workingGroup) {
        return;
      }

      const references =
        role ===
        "PEER_SUPPORTER"
          ? workingGroup.peerSupporters
          : workingGroup.moderators;

      const assigned =
        isUserAssigned(
          references,
          user.id
        );

      const key =
        `${role}:${user.id}`;

      try {
        setProcessingKey(
          key
        );

        setError(null);

        let response;

        if (
          role ===
          "PEER_SUPPORTER"
        ) {
          response =
            assigned
              ? await groupApi.removePeerSupporter(
                  workingGroup.id,
                  user.id
                )
              : await groupApi.assignPeerSupporter(
                  workingGroup.id,
                  user.id
                );
        } else {
          response =
            assigned
              ? await groupApi.removeModerator(
                  workingGroup.id,
                  user.id
                )
              : await groupApi.assignModerator(
                  workingGroup.id,
                  user.id
                );
        }

        const updatedGroup =
          response.data.group;

        setWorkingGroup(
          updatedGroup
        );

        onGroupUpdated(
          updatedGroup
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
        setProcessingKey(
          null
        );
      }
    };

  const handleClose =
    () => {
      if (processingKey) {
        return;
      }

      setError(null);

      onClose();
    };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={
        handleClose
      }
    >
      <View
        style={
          styles.overlay
        }
      >
        <Pressable
          style={styles.backdrop}
          onPress={
            handleClose
          }
        />

        <View
          style={
            styles.container
          }
        >
          <View
            style={
              styles.header
            }
          >
            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={
                  styles.title
                }
              >
                Manage Staff
              </Text>

              <Text
                numberOfLines={1}
                style={
                  styles.subtitle
                }
              >
                {workingGroup
                  ?.name ??
                  "Support Group"}
              </Text>
            </View>

            <Pressable
              onPress={
                handleClose
              }
              hitSlop={10}
            >
              <Ionicons
                name="close"
                size={26}
                color="#475569"
              />
            </Pressable>
          </View>

          {error && (
            <View
              style={
                styles.errorBox
              }
            >
              <Ionicons
                name="alert-circle-outline"
                size={19}
                color="#b91c1c"
              />

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
                Loading available
                staff...
              </Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.scrollContent
              }
            >
              <StaffSection
                title="Peer Supporters"
                description="Assign Peer Supporters who can support members and review join requests."
                icon="heart-outline"
                users={
                  peerSupporters
                }
                assignedUsers={
                  workingGroup
                    ?.peerSupporters ??
                  []
                }
                role="PEER_SUPPORTER"
                processingKey={
                  processingKey
                }
                onToggle={
                  handleToggleAssignment
                }
              />

              <StaffSection
                title="Moderators"
                description="Assign Moderators who are responsible for safety and moderation."
                icon="shield-checkmark-outline"
                users={
                  moderators
                }
                assignedUsers={
                  workingGroup
                    ?.moderators ??
                  []
                }
                role="MODERATOR"
                processingKey={
                  processingKey
                }
                onToggle={
                  handleToggleAssignment
                }
              />
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

interface StaffSectionProps {
  title: string;
  description: string;

  icon:
    | "heart-outline"
    | "shield-checkmark-outline";

  users: AdminUser[];

  assignedUsers:
    GroupUserReference[];

  role: StaffRole;

  processingKey:
    | string
    | null;

  onToggle: (
    role: StaffRole,
    user: AdminUser
  ) => Promise<void>;
}

function StaffSection({
  title,
  description,
  icon,
  users,
  assignedUsers,
  role,
  processingKey,
  onToggle,
}: StaffSectionProps) {
  return (
    <View
      style={
        styles.section
      }
    >
      <View
        style={
          styles.sectionHeader
        }
      >
        <View
          style={
            styles.sectionIcon
          }
        >
          <Ionicons
            name={icon}
            size={21}
            color="#4f46e5"
          />
        </View>

        <View
          style={{
            flex: 1,
          }}
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            {title}
          </Text>

          <Text
            style={
              styles.sectionDescription
            }
          >
            {description}
          </Text>
        </View>
      </View>

      {users.length ===
      0 ? (
        <View
          style={
            styles.emptyBox
          }
        >
          <Ionicons
            name="person-add-outline"
            size={25}
            color="#94a3b8"
          />

          <Text
            style={
              styles.emptyText
            }
          >
            No active{" "}
            {title.toLowerCase()}{" "}
            available.
          </Text>

          <Text
            style={
              styles.emptySubText
            }
          >
            Create or change a
            user role from Admin
            Users first.
          </Text>
        </View>
      ) : (
        users.map(
          (user) => {
            const assigned =
              isUserAssigned(
                assignedUsers,
                user.id
              );

            const key =
              `${role}:${user.id}`;

            const processing =
              processingKey ===
              key;

            const disabled =
              processingKey !==
                null &&
              !processing;

            return (
              <View
                key={
                  user.id
                }
                style={
                  styles.staffRow
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
                  style={
                    styles.staffInfo
                  }
                >
                  <Text
                    numberOfLines={
                      1
                    }
                    style={
                      styles.staffName
                    }
                  >
                    {
                      user.fullName
                    }
                  </Text>

                  <Text
                    numberOfLines={
                      1
                    }
                    style={
                      styles.staffEmail
                    }
                  >
                    {
                      user.email
                    }
                  </Text>

                  {assigned && (
                    <View
                      style={
                        styles.assignedBadge
                      }
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={13}
                        color="#047857"
                      />

                      <Text
                        style={
                          styles.assignedText
                        }
                      >
                        Assigned
                      </Text>
                    </View>
                  )}
                </View>

                <Pressable
                  disabled={
                    disabled ||
                    processing
                  }
                  onPress={() =>
                    void onToggle(
                      role,
                      user
                    )
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.actionButton,

                    assigned
                      ? styles.removeButton
                      : styles.assignButton,

                    pressed &&
                      !processing &&
                      styles.pressedButton,

                    disabled &&
                      styles.disabledButton,
                  ]}
                >
                  {processing ? (
                    <ActivityIndicator
                      size="small"
                      color={
                        assigned
                          ? "#b91c1c"
                          : "#ffffff"
                      }
                    />
                  ) : (
                    <Text
                      style={[
                        styles.actionText,

                        assigned
                          ? styles.removeText
                          : styles.assignText,
                      ]}
                    >
                      {assigned
                        ? "Remove"
                        : "Assign"}
                    </Text>
                  )}
                </Pressable>
              </View>
            );
          }
        )
      )}
    </View>
  );
}

function getInitials(
  fullName: string
) {
  const parts =
    fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (
    parts.length === 0
  ) {
    return "?";
  }

  if (
    parts.length === 1
  ) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    `${parts[0][0]}${
      parts[
        parts.length - 1
      ][0]
    }`
  ).toUpperCase();
}

const styles =
  StyleSheet.create({
    overlay: {
      flex: 1,

      justifyContent:
        "flex-end",

      backgroundColor:
        "rgba(15, 23, 42, 0.45)",
    },

    backdrop: {
      flex: 1,
    },

    container: {
      maxHeight: "88%",

      minHeight: "60%",

      borderTopLeftRadius:
        28,

      borderTopRightRadius:
        28,

      backgroundColor:
        "#ffffff",

      overflow: "hidden",
    },

    header: {
      flexDirection: "row",

      alignItems:
        "center",

      paddingHorizontal:
        20,

      paddingTop: 20,

      paddingBottom: 16,

      borderBottomWidth: 1,

      borderBottomColor:
        "#f1f5f9",
    },

    title: {
      fontSize: 21,

      fontWeight: "800",

      color: "#0f172a",
    },

    subtitle: {
      marginTop: 3,

      marginRight: 20,

      fontSize: 13,

      color: "#64748b",
    },

    errorBox: {
      marginHorizontal:
        20,

      marginTop: 14,

      padding: 13,

      flexDirection: "row",

      alignItems:
        "flex-start",

      borderWidth: 1,

      borderColor:
        "#fecaca",

      borderRadius: 13,

      backgroundColor:
        "#fef2f2",
    },

    errorText: {
      flex: 1,

      marginLeft: 8,

      lineHeight: 19,

      color: "#b91c1c",
    },

    loadingArea: {
      minHeight: 300,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loadingText: {
      marginTop: 12,

      color: "#64748b",
    },

    scrollContent: {
      padding: 20,

      paddingBottom: 50,
    },

    section: {
      marginBottom: 24,
    },

    sectionHeader: {
      flexDirection: "row",

      alignItems:
        "flex-start",

      marginBottom: 12,
    },

    sectionIcon: {
      width: 40,

      height: 40,

      marginRight: 11,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 13,

      backgroundColor:
        "#eef2ff",
    },

    sectionTitle: {
      fontSize: 17,

      fontWeight: "800",

      color: "#0f172a",
    },

    sectionDescription: {
      marginTop: 3,

      lineHeight: 18,

      fontSize: 12,

      color: "#64748b",
    },

    emptyBox: {
      paddingVertical: 25,

      paddingHorizontal:
        15,

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        "#e2e8f0",

      borderRadius: 16,

      backgroundColor:
        "#f8fafc",
    },

    emptyText: {
      marginTop: 8,

      fontWeight: "700",

      color: "#475569",
    },

    emptySubText: {
      marginTop: 4,

      textAlign: "center",

      fontSize: 12,

      color: "#94a3b8",
    },

    staffRow: {
      flexDirection: "row",

      alignItems:
        "center",

      marginBottom: 10,

      padding: 12,

      borderWidth: 1,

      borderColor:
        "#e2e8f0",

      borderRadius: 16,

      backgroundColor:
        "#ffffff",
    },

    avatar: {
      width: 42,

      height: 42,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 21,

      backgroundColor:
        "#eef2ff",
    },

    avatarText: {
      fontSize: 13,

      fontWeight: "800",

      color: "#4f46e5",
    },

    staffInfo: {
      flex: 1,

      marginHorizontal:
        11,
    },

    staffName: {
      fontSize: 14,

      fontWeight: "700",

      color: "#0f172a",
    },

    staffEmail: {
      marginTop: 2,

      fontSize: 11,

      color: "#64748b",
    },

    assignedBadge: {
      alignSelf:
        "flex-start",

      marginTop: 5,

      paddingHorizontal: 7,

      paddingVertical: 3,

      flexDirection: "row",

      alignItems:
        "center",

      borderRadius: 999,

      backgroundColor:
        "#ecfdf5",
    },

    assignedText: {
      marginLeft: 3,

      fontSize: 10,

      fontWeight: "700",

      color: "#047857",
    },

    actionButton: {
      minWidth: 72,

      minHeight: 38,

      paddingHorizontal:
        10,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 11,
    },

    assignButton: {
      backgroundColor:
        "#4f46e5",
    },

    removeButton: {
      borderWidth: 1,

      borderColor:
        "#fecaca",

      backgroundColor:
        "#fef2f2",
    },

    actionText: {
      fontSize: 12,

      fontWeight: "800",
    },

    assignText: {
      color: "#ffffff",
    },

    removeText: {
      color: "#b91c1c",
    },

    pressedButton: {
      opacity: 0.8,
    },

    disabledButton: {
      opacity: 0.5,
    },
  });