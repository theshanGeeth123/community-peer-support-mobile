import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
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
    type Href,
    router,
} from "expo-router";

import {
    groupApi,
} from "@/features/groups/api/group.api";

import type {
    GroupPagination,
    SupportGroup,
} from "@/features/groups/types/group.types";

import {
    getApiErrorMessage,
} from "@/services/api/apiError";

import GroupStaffAssignmentModal from "./GroupStaffAssignmentModal";

const PAGE_SIZE = 50;

const EMPTY_PAGINATION: GroupPagination =
  {
    page: 1,
    limit: PAGE_SIZE,

    totalGroups: 0,
    totalPages: 1,

    hasNextPage: false,
    hasPreviousPage:
      false,
  };

export default function AdminGroupManagementScreen() {
  const [
    groups,
    setGroups,
  ] =
    useState<
      SupportGroup[]
    >([]);

  const [
    pagination,
    setPagination,
  ] =
    useState<GroupPagination>(
      EMPTY_PAGINATION
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    debouncedSearch,
    setDebouncedSearch,
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

  const [
    createModalVisible,
    setCreateModalVisible,
  ] =
    useState(false);

  const [
    creating,
    setCreating,
  ] =
    useState(false);

  const [
    createError,
    setCreateError,
  ] =
    useState<string | null>(
      null
    );

  const [
    selectedGroup,
    setSelectedGroup,
  ] =
    useState<
      SupportGroup | null
    >(null);

  const [
    assignmentModalVisible,
    setAssignmentModalVisible,
  ] =
    useState(false);

  const [
    name,
    setName,
  ] =
    useState("");

  const [
    category,
    setCategory,
  ] =
    useState("");

  const [
    communityLocation,
    setCommunityLocation,
  ] =
    useState("");

  const [
    description,
    setDescription,
  ] =
    useState("");

  const [
    rulesText,
    setRulesText,
  ] =
    useState("");

  useEffect(() => {
    const timer =
      setTimeout(() => {
        setDebouncedSearch(
          search.trim()
        );
      }, 400);

    return () => {
      clearTimeout(
        timer
      );
    };
  }, [search]);

  const loadGroups =
    useCallback(
      async () => {
        try {
          setError(null);

          const response =
            await groupApi.getGroups(
              {
                page: 1,

                limit:
                  PAGE_SIZE,

                search:
                  debouncedSearch ||
                  undefined,
              }
            );

          const responseGroups =
            Array.isArray(
              response.data
                .groups
            )
              ? response.data
                  .groups
              : [];

          setGroups(
            responseGroups
          );

          setPagination({
            page:
              response.data
                .pagination
                ?.page ?? 1,

            limit:
              response.data
                .pagination
                ?.limit ??
              PAGE_SIZE,

            totalGroups:
              response.data
                .pagination
                ?.totalGroups ??
              responseGroups.length,

            totalPages:
              Math.max(
                response.data
                  .pagination
                  ?.totalPages ??
                  1,
                1
              ),

            hasNextPage:
              response.data
                .pagination
                ?.hasNextPage ??
              false,

            hasPreviousPage:
              response.data
                .pagination
                ?.hasPreviousPage ??
              false,
          });
        } catch (
          requestError
        ) {
          setGroups([]);

          setPagination(
            EMPTY_PAGINATION
          );

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
      [
        debouncedSearch,
      ]
    );

  useEffect(() => {
    setLoading(true);

    void loadGroups();
  }, [loadGroups]);

  const handleRefresh =
    () => {
      setRefreshing(
        true
      );

      void loadGroups();
    };

  const resetCreateForm =
    () => {
      setName("");

      setCategory("");

      setCommunityLocation(
        ""
      );

      setDescription(
        ""
      );

      setRulesText("");

      setCreateError(
        null
      );
    };

  const openCreateModal =
    () => {
      resetCreateForm();

      setCreateModalVisible(
        true
      );
    };

  const closeCreateModal =
    () => {
      if (creating) {
        return;
      }

      setCreateModalVisible(
        false
      );

      resetCreateForm();
    };

  const handleCreateGroup =
    async () => {
      const cleanName =
        name.trim();

      const cleanCategory =
        category.trim();

      const cleanDescription =
        description.trim();

      const cleanLocation =
        communityLocation.trim();

      if (
        cleanName.length < 3
      ) {
        setCreateError(
          "Group name must contain at least 3 characters."
        );

        return;
      }

      if (
        cleanCategory.length <
        2
      ) {
        setCreateError(
          "Please enter a valid group category."
        );

        return;
      }

      if (
        cleanDescription.length <
        10
      ) {
        setCreateError(
          "Group description must contain at least 10 characters."
        );

        return;
      }

      const rules =
        rulesText
          .split("\n")
          .map(
            (rule) =>
              rule.trim()
          )
          .filter(
            Boolean
          );

      const invalidRule =
        rules.some(
          (rule) =>
            rule.length <
              3 ||
            rule.length >
              300
        );

      if (invalidRule) {
        setCreateError(
          "Each rule must contain between 3 and 300 characters."
        );

        return;
      }

      if (
        rules.length > 20
      ) {
        setCreateError(
          "A group can contain a maximum of 20 rules."
        );

        return;
      }

      try {
        setCreating(true);

        setCreateError(
          null
        );

        await groupApi.createGroup(
          {
            name:
              cleanName,

            category:
              cleanCategory,

            description:
              cleanDescription,

            communityLocation:
              cleanLocation ||
              null,

            rules,
          }
        );

        setCreateModalVisible(
          false
        );

        resetCreateForm();

        setLoading(true);

        await loadGroups();
      } catch (
        requestError
      ) {
        setCreateError(
          getApiErrorMessage(
            requestError
          )
        );
      } finally {
        setCreating(
          false
        );
      }
    };

  const openAssignmentModal =
    (
      group: SupportGroup
    ) => {
      setSelectedGroup(
        group
      );

      setAssignmentModalVisible(
        true
      );
    };

  const closeAssignmentModal =
    () => {
      setAssignmentModalVisible(
        false
      );

      setSelectedGroup(
        null
      );
    };

  const handleGroupUpdated =
    (
      updatedGroup: SupportGroup
    ) => {
      const normalizedGroup: SupportGroup =
        {
          ...updatedGroup,

          peerSupporterCount:
            updatedGroup
              .peerSupporters
              .length,

          moderatorCount:
            updatedGroup
              .moderators
              .length,
        };

      setGroups(
        (
          currentGroups
        ) =>
          currentGroups.map(
            (group) =>
              group.id ===
              normalizedGroup.id
                ? {
                    ...group,

                    ...normalizedGroup,
                  }
                : group
          )
      );

      setSelectedGroup(
        normalizedGroup
      );
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
            Group Management
          </Text>

          <Text
            style={
              styles.headingDescription
            }
          >
            Create groups and
            assign Peer
            Supporters and
            Moderators.
          </Text>
        </View>

        <View
          style={
            styles.summaryCard
          }
        >
          <View>
            <Text
              style={
                styles.summaryLabel
              }
            >
              Total Groups
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {
                pagination.totalGroups
              }
            </Text>
          </View>

          <Pressable
            onPress={
              openCreateModal
            }
            style={({
              pressed,
            }) => [
              styles.createButton,

              pressed && {
                opacity: 0.85,
              },
            ]}
          >
            <Ionicons
              name="add"
              size={20}
              color="#ffffff"
            />

            <Text
              style={
                styles.createButtonText
              }
            >
              Create Group
            </Text>
          </Pressable>
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
              onPress={() =>
                setSearch("")
              }
              hitSlop={10}
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
            <Text
              style={
                styles.errorText
              }
            >
              {error}
            </Text>

            <Pressable
              onPress={() => {
                setLoading(
                  true
                );

                void loadGroups();
              }}
            >
              <Text
                style={
                  styles.tryAgain
                }
              >
                Try Again
              </Text>
            </Pressable>
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
              Loading groups...
            </Text>
          </View>
        ) : groups.length ===
          0 ? (
          <View
            style={
              styles.emptyArea
            }
          >
            <View
              style={
                styles.emptyIcon
              }
            >
              <Ionicons
                name="people-outline"
                size={29}
                color="#4f46e5"
              />
            </View>

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
              {debouncedSearch
                ? "No groups match your search."
                : "Create your first support group to continue."}
            </Text>
          </View>
        ) : (
          <View
            style={
              styles.groupList
            }
          >
            {groups.map(
              (group) => (
                <GroupCard
                  key={
                    group.id
                  }
                  group={
                    group
                  }
                  onManage={() =>
                    openAssignmentModal(
                      group
                    )
                  }
                />
              )
            )}
          </View>
        )}
      </ScrollView>

      <CreateGroupModal
        visible={
          createModalVisible
        }
        creating={
          creating
        }
        error={
          createError
        }
        name={name}
        category={
          category
        }
        location={
          communityLocation
        }
        description={
          description
        }
        rulesText={
          rulesText
        }
        onNameChange={
          setName
        }
        onCategoryChange={
          setCategory
        }
        onLocationChange={
          setCommunityLocation
        }
        onDescriptionChange={
          setDescription
        }
        onRulesChange={
          setRulesText
        }
        onClose={
          closeCreateModal
        }
        onSubmit={() =>
          void handleCreateGroup()
        }
      />

      <GroupStaffAssignmentModal
        visible={
          assignmentModalVisible
        }
        group={
          selectedGroup
        }
        onClose={
          closeAssignmentModal
        }
        onGroupUpdated={
          handleGroupUpdated
        }
      />
    </SafeAreaView>
  );
}

function GroupCard({
  group,
  onManage,
}: {
  group: SupportGroup;
  onManage: () => void;
}) {
  const peerCount =
    group.peerSupporterCount ??
    group.peerSupporters.length;

  const moderatorCount =
    group.moderatorCount ??
    group.moderators.length;

  return (
    <View
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

        <View
          style={[
            styles.statusBadge,

            group.status ===
            "ACTIVE"
              ? styles.activeBadge
              : styles.inactiveBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,

              group.status ===
              "ACTIVE"
                ? styles.activeText
                : styles.inactiveText,
            ]}
          >
            {group.status}
          </Text>
        </View>
      </View>

      <Text
        numberOfLines={3}
        style={
          styles.description
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
          styles.staffSummary
        }
      >
        <View
          style={
            styles.staffCount
          }
        >
          <Ionicons
            name="heart-outline"
            size={17}
            color="#6366f1"
          />

          <Text
            style={
              styles.staffCountText
            }
          >
            {peerCount} Peer
            Supporter
            {peerCount ===
            1
              ? ""
              : "s"}
          </Text>
        </View>

        <View
          style={
            styles.staffCount
          }
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={17}
            color="#6366f1"
          />

          <Text
            style={
              styles.staffCountText
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
          onManage
        }
        style={({
          pressed,
        }) => [
          styles.manageButton,

          pressed && {
            opacity: 0.8,
          },
        ]}
      >
        <Ionicons
          name="people-circle-outline"
          size={19}
          color="#4f46e5"
        />

        <Text
          style={
            styles.manageButtonText
          }
        >
          Manage Staff
        </Text>

        <Ionicons
          name="chevron-forward"
          size={18}
          color="#6366f1"
        />
      </Pressable>

      <Pressable
        onPress={() =>
          router.push({
            pathname:
              "/(app)/admin/group/[groupId]/posts" as Href,

            params: {
              groupId: group.id,
            },
          })
        }
        style={({
          pressed,
        }) => [
          styles.manageButton,
          { marginTop: 10 },

          pressed && {
            opacity: 0.8,
          },
        ]}
      >
        <Ionicons
          name="chatbubbles-outline"
          size={19}
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
          size={18}
          color="#6366f1"
        />
      </Pressable>
    </View>
  );
}

interface CreateGroupModalProps {
  visible: boolean;
  creating: boolean;

  error:
    | string
    | null;

  name: string;
  category: string;
  location: string;
  description: string;
  rulesText: string;

  onNameChange: (
    value: string
  ) => void;

  onCategoryChange: (
    value: string
  ) => void;

  onLocationChange: (
    value: string
  ) => void;

  onDescriptionChange: (
    value: string
  ) => void;

  onRulesChange: (
    value: string
  ) => void;

  onClose: () => void;
  onSubmit: () => void;
}

function CreateGroupModal({
  visible,
  creating,
  error,
  name,
  category,
  location,
  description,
  rulesText,
  onNameChange,
  onCategoryChange,
  onLocationChange,
  onDescriptionChange,
  onRulesChange,
  onClose,
  onSubmit,
}: CreateGroupModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={
        onClose
      }
    >
      <KeyboardAvoidingView
        style={{
          flex: 1,
        }}
        behavior={
          Platform.OS ===
          "ios"
            ? "padding"
            : undefined
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <Pressable
            style={{
              flex: 1,
            }}
            onPress={
              onClose
            }
          />

          <View
            style={
              styles.createModal
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <View
                style={{
                  flex: 1,
                }}
              >
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Create Support
                  Group
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Add the basic
                  group information.
                </Text>
              </View>

              <Pressable
                disabled={
                  creating
                }
                onPress={
                  onClose
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

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.formContent
              }
            >
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

              <FieldLabel
                text="Group Name *"
              />

              <TextInput
                value={name}
                onChangeText={
                  onNameChange
                }
                editable={
                  !creating
                }
                placeholder="e.g. Student Stress Support"
                placeholderTextColor="#94a3b8"
                style={
                  styles.input
                }
              />

              <FieldLabel
                text="Category *"
              />

              <TextInput
                value={
                  category
                }
                onChangeText={
                  onCategoryChange
                }
                editable={
                  !creating
                }
                placeholder="e.g. Student Well-being"
                placeholderTextColor="#94a3b8"
                style={
                  styles.input
                }
              />

              <FieldLabel
                text="Community Location"
              />

              <TextInput
                value={
                  location
                }
                onChangeText={
                  onLocationChange
                }
                editable={
                  !creating
                }
                placeholder="e.g. Colombo"
                placeholderTextColor="#94a3b8"
                style={
                  styles.input
                }
              />

              <FieldLabel
                text="Description *"
              />

              <TextInput
                value={
                  description
                }
                onChangeText={
                  onDescriptionChange
                }
                editable={
                  !creating
                }
                placeholder="Describe the purpose of this group..."
                placeholderTextColor="#94a3b8"
                multiline
                textAlignVertical="top"
                style={[
                  styles.input,
                  styles.largeInput,
                ]}
              />

              <FieldLabel
                text="Group Rules"
              />

              <Text
                style={
                  styles.fieldHint
                }
              >
                Enter one rule
                per line.
              </Text>

              <TextInput
                value={
                  rulesText
                }
                onChangeText={
                  onRulesChange
                }
                editable={
                  !creating
                }
                placeholder={
                  "Respect every member\nKeep discussions private\nAvoid abusive language"
                }
                placeholderTextColor="#94a3b8"
                multiline
                textAlignVertical="top"
                style={[
                  styles.input,
                  styles.rulesInput,
                ]}
              />

              <Pressable
                disabled={
                  creating
                }
                onPress={
                  onSubmit
                }
                style={[
                  styles.submitButton,

                  creating && {
                    opacity: 0.6,
                  },
                ]}
              >
                {creating ? (
                  <ActivityIndicator
                    color="#ffffff"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="add-circle-outline"
                      size={21}
                      color="#ffffff"
                    />

                    <Text
                      style={
                        styles.submitButtonText
                      }
                    >
                      Create Group
                    </Text>
                  </>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function FieldLabel({
  text,
}: {
  text: string;
}) {
  return (
    <Text
      style={
        styles.fieldLabel
      }
    >
      {text}
    </Text>
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
      paddingRight: 54,
    },

    heading: {
      fontSize: 28,

      fontWeight: "800",

      color: "#0f172a",
    },

    headingDescription: {
      marginTop: 6,

      fontSize: 14,

      lineHeight: 20,

      color: "#64748b",
    },

    summaryCard: {
      marginTop: 20,

      padding: 16,

      flexDirection: "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      borderRadius: 20,

      borderWidth: 1,

      borderColor:
        "#e2e8f0",

      backgroundColor:
        "#ffffff",
    },

    summaryLabel: {
      fontSize: 13,

      color: "#64748b",
    },

    summaryValue: {
      marginTop: 3,

      fontSize: 28,

      fontWeight: "800",

      color: "#0f172a",
    },

    createButton: {
      minHeight: 46,

      paddingHorizontal:
        15,

      flexDirection: "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 14,

      backgroundColor:
        "#4f46e5",
    },

    createButtonText: {
      marginLeft: 6,

      fontWeight: "700",

      color: "#ffffff",
    },

    searchBox: {
      minHeight: 50,

      marginTop: 16,

      paddingHorizontal:
        14,

      flexDirection: "row",

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

      marginLeft: 10,

      fontSize: 15,

      color: "#0f172a",
    },

    errorBox: {
      marginTop: 16,

      padding: 14,

      borderRadius: 14,

      borderWidth: 1,

      borderColor:
        "#fecaca",

      backgroundColor:
        "#fef2f2",
    },

    errorText: {
      lineHeight: 20,

      color: "#b91c1c",
    },

    tryAgain: {
      marginTop: 10,

      fontWeight: "700",

      color: "#4f46e5",
    },

    loadingArea: {
      paddingVertical: 80,

      alignItems:
        "center",
    },

    loadingText: {
      marginTop: 12,

      color: "#64748b",
    },

    emptyArea: {
      marginTop: 24,

      paddingVertical: 50,

      paddingHorizontal:
        20,

      alignItems:
        "center",

      borderRadius: 20,

      borderWidth: 1,

      borderColor:
        "#e2e8f0",

      backgroundColor:
        "#ffffff",
    },

    emptyIcon: {
      width: 58,

      height: 58,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 29,

      backgroundColor:
        "#eef2ff",
    },

    emptyTitle: {
      marginTop: 14,

      fontSize: 17,

      fontWeight: "700",

      color: "#0f172a",
    },

    emptyDescription: {
      marginTop: 6,

      textAlign: "center",

      lineHeight: 20,

      color: "#64748b",
    },

    groupList: {
      marginTop: 18,
    },

    groupCard: {
      marginBottom: 14,

      padding: 17,

      borderRadius: 20,

      borderWidth: 1,

      borderColor:
        "#e2e8f0",

      backgroundColor:
        "#ffffff",
    },

    cardTop: {
      flexDirection: "row",

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

      marginLeft: 12,
    },

    groupName: {
      fontSize: 17,

      fontWeight: "800",

      color: "#0f172a",
    },

    category: {
      marginTop: 3,

      fontSize: 13,

      fontWeight: "600",

      color: "#6366f1",
    },

    statusBadge: {
      paddingHorizontal: 9,

      paddingVertical: 5,

      borderRadius: 999,
    },

    activeBadge: {
      backgroundColor:
        "#ecfdf5",
    },

    inactiveBadge: {
      backgroundColor:
        "#f1f5f9",
    },

    statusText: {
      fontSize: 10,

      fontWeight: "700",
    },

    activeText: {
      color: "#047857",
    },

    inactiveText: {
      color: "#64748b",
    },

    description: {
      marginTop: 14,

      fontSize: 14,

      lineHeight: 21,

      color: "#475569",
    },

    locationRow: {
      marginTop: 11,

      flexDirection: "row",

      alignItems:
        "center",
    },

    locationText: {
      marginLeft: 5,

      fontSize: 13,

      color: "#64748b",
    },

    staffSummary: {
      marginTop: 15,

      paddingTop: 14,

      flexDirection: "row",

      borderTopWidth: 1,

      borderTopColor:
        "#f1f5f9",
    },

    staffCount: {
      flex: 1,

      flexDirection: "row",

      alignItems:
        "center",
    },

    staffCountText: {
      marginLeft: 6,

      fontSize: 11,

      color: "#64748b",
    },

    manageButton: {
      minHeight: 45,

      marginTop: 15,

      paddingHorizontal:
        13,

      flexDirection: "row",

      alignItems:
        "center",

      borderRadius: 13,

      borderWidth: 1,

      borderColor:
        "#c7d2fe",

      backgroundColor:
        "#eef2ff",
    },

    manageButtonText: {
      flex: 1,

      marginLeft: 8,

      fontWeight: "700",

      color: "#4f46e5",
    },

    modalOverlay: {
      flex: 1,

      justifyContent:
        "flex-end",

      backgroundColor:
        "rgba(15, 23, 42, 0.45)",
    },

    createModal: {
      maxHeight: "90%",

      borderTopLeftRadius:
        28,

      borderTopRightRadius:
        28,

      backgroundColor:
        "#ffffff",
    },

    modalHeader: {
      paddingHorizontal:
        20,

      paddingTop: 18,

      paddingBottom: 14,

      flexDirection: "row",

      alignItems:
        "center",

      borderBottomWidth: 1,

      borderBottomColor:
        "#f1f5f9",
    },

    modalTitle: {
      fontSize: 21,

      fontWeight: "800",

      color: "#0f172a",
    },

    modalSubtitle: {
      marginTop: 3,

      fontSize: 13,

      color: "#64748b",
    },

    formContent: {
      padding: 20,

      paddingBottom: 40,
    },

    fieldLabel: {
      marginTop: 14,

      marginBottom: 7,

      fontSize: 13,

      fontWeight: "700",

      color: "#334155",
    },

    fieldHint: {
      marginTop: -4,

      marginBottom: 8,

      fontSize: 12,

      color: "#94a3b8",
    },

    input: {
      minHeight: 50,

      paddingHorizontal:
        14,

      borderWidth: 1,

      borderColor:
        "#cbd5e1",

      borderRadius: 14,

      backgroundColor:
        "#ffffff",

      fontSize: 15,

      color: "#0f172a",
    },

    largeInput: {
      minHeight: 110,

      paddingTop: 14,
    },

    rulesInput: {
      minHeight: 130,

      paddingTop: 14,
    },

    submitButton: {
      minHeight: 54,

      marginTop: 22,

      flexDirection: "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 16,

      backgroundColor:
        "#4f46e5",
    },

    submitButtonText: {
      marginLeft: 8,

      fontSize: 15,

      fontWeight: "800",

      color: "#ffffff",
    },
  });