import {
  useCallback,
  useMemo,
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
  useFocusEffect,
  useLocalSearchParams,
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
  JoinRequestUser,
} from "@/features/groups/types/groupMembership.types";

import {
  getApiErrorMessage,
} from "@/services/api/apiError";

interface RequestWithGroup {
  request: GroupJoinRequest;
  group: SupportGroup;
}

type ReviewAction =
  | "APPROVE"
  | "REJECT";

interface SelectedReview {
  item: RequestWithGroup;
  action: ReviewAction;
}

export default function PeerSupporterJoinRequestsScreen() {
  const params =
    useLocalSearchParams();

  const rawGroupId =
    params.groupId;

  const initialGroupId =
    Array.isArray(
      rawGroupId
    )
      ? rawGroupId[0]
      : rawGroupId;

  const [
    groups,
    setGroups,
  ] =
    useState<SupportGroup[]>(
      []
    );

  const [
    requests,
    setRequests,
  ] =
    useState<
      RequestWithGroup[]
    >([]);

  const [
    selectedGroupId,
    setSelectedGroupId,
  ] =
    useState<string | null>(
      initialGroupId ??
        null
    );

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
    selectedReview,
    setSelectedReview,
  ] =
    useState<
      SelectedReview | null
    >(null);

  const [
    reviewNote,
    setReviewNote,
  ] =
    useState("");

  const [
    reviewError,
    setReviewError,
  ] =
    useState<string | null>(
      null
    );

  const [
    processing,
    setProcessing,
  ] =
    useState(false);

  const loadRequests =
    useCallback(
      async (
        showLoading = true
      ) => {
        try {
          if (showLoading) {
            setLoading(true);
          }

          setError(null);

          const groupsResponse =
            await groupApi.getMyAssignedGroups();

          const assignedGroups =
            Array.isArray(
              groupsResponse.data
                .groups
            )
              ? groupsResponse
                  .data.groups
              : [];

          setGroups(
            assignedGroups
          );

          if (
            assignedGroups.length ===
            0
          ) {
            setRequests([]);

            return;
          }

          const responses =
            await Promise.all(
              assignedGroups.map(
                async (
                  group
                ) => {
                  const response =
                    await groupMembershipApi.getGroupJoinRequests(
                      group.id
                    );

                  const groupRequests =
                    Array.isArray(
                      response.data
                        .requests
                    )
                      ? response
                          .data
                          .requests
                      : [];

                  return groupRequests.map(
                    (
                      request
                    ) => ({
                      request,
                      group,
                    })
                  );
                }
              )
            );

          setRequests(
            responses.flat()
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
      if (initialGroupId) {
        setSelectedGroupId(
          initialGroupId
        );
      }

      void loadRequests();

      return undefined;
    }, [
      initialGroupId,
      loadRequests,
    ])
  );

  const filteredRequests =
    useMemo(() => {
      if (
        !selectedGroupId
      ) {
        return requests;
      }

      return requests.filter(
        (item) =>
          item.group.id ===
          selectedGroupId
      );
    }, [
      requests,
      selectedGroupId,
    ]);

  const handleRefresh =
    () => {
      setRefreshing(true);

      void loadRequests(
        false
      );
    };

  const openReview =
    (
      item: RequestWithGroup,
      action: ReviewAction
    ) => {
      setSelectedReview({
        item,
        action,
      });

      setReviewNote("");

      setReviewError(
        null
      );
    };

  const closeReview =
    () => {
      if (processing) {
        return;
      }

      setSelectedReview(
        null
      );

      setReviewNote("");

      setReviewError(
        null
      );
    };

  const submitReview =
    async () => {
      if (!selectedReview) {
        return;
      }

      const cleanNote =
        reviewNote.trim();

      if (
        cleanNote.length >
        500
      ) {
        setReviewError(
          "Review note cannot exceed 500 characters."
        );

        return;
      }

      try {
        setProcessing(true);

        setReviewError(
          null
        );

        const requestId =
          selectedReview
            .item.request.id;

        if (
          selectedReview.action ===
          "APPROVE"
        ) {
          await groupMembershipApi.approveJoinRequest(
            requestId,
            {
              reviewNote:
                cleanNote ||
                null,
            }
          );
        } else {
          await groupMembershipApi.rejectJoinRequest(
            requestId,
            {
              reviewNote:
                cleanNote ||
                null,
            }
          );
        }

        setSelectedReview(
          null
        );

        setReviewNote("");

        await loadRequests(
          false
        );
      } catch (
        requestError
      ) {
        setReviewError(
          getApiErrorMessage(
            requestError
          )
        );
      } finally {
        setProcessing(
          false
        );
      }
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
            Join Requests
          </Text>

          <Text
            style={
              styles.headingDescription
            }
          >
            Review membership
            requests only for
            groups assigned to
            you.
          </Text>
        </View>

        <View
          style={
            styles.summaryRow
          }
        >
          <SummaryCard
            icon="people-outline"
            label="Assigned Groups"
            value={
              groups.length
            }
          />

          <SummaryCard
            icon="time-outline"
            label="Pending"
            value={
              requests.length
            }
          />
        </View>

        {groups.length >
          0 && (
          <View
            style={
              styles.filterSection
            }
          >
            <Text
              style={
                styles.filterTitle
              }
            >
              Filter by Group
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={{
                paddingRight: 10,
              }}
            >
              <FilterChip
                label="All Groups"
                selected={
                  selectedGroupId ===
                  null
                }
                onPress={() =>
                  setSelectedGroupId(
                    null
                  )
                }
              />

              {groups.map(
                (group) => (
                  <FilterChip
                    key={
                      group.id
                    }
                    label={
                      group.name
                    }
                    selected={
                      selectedGroupId ===
                      group.id
                    }
                    onPress={() =>
                      setSelectedGroupId(
                        group.id
                      )
                    }
                  />
                )
              )}
            </ScrollView>
          </View>
        )}

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
                  void loadRequests()
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
              Loading join
              requests...
            </Text>
          </View>
        ) : groups.length ===
          0 ? (
          <EmptyState
            icon="people-outline"
            title="No groups assigned"
            description="An Administrator must assign you to a support group before you can review requests."
          />
        ) : filteredRequests.length ===
          0 ? (
          <EmptyState
            icon="checkmark-circle-outline"
            title="No pending requests"
            description="There are currently no membership requests waiting for your review."
          />
        ) : (
          <View
            style={
              styles.requestList
            }
          >
            {filteredRequests.map(
              (item) => (
                <RequestCard
                  key={
                    item.request
                      .id
                  }
                  item={
                    item
                  }
                  onApprove={() =>
                    openReview(
                      item,
                      "APPROVE"
                    )
                  }
                  onReject={() =>
                    openReview(
                      item,
                      "REJECT"
                    )
                  }
                />
              )
            )}
          </View>
        )}
      </ScrollView>

      <ReviewModal
        selectedReview={
          selectedReview
        }
        reviewNote={
          reviewNote
        }
        error={
          reviewError
        }
        processing={
          processing
        }
        onReviewNoteChange={
          setReviewNote
        }
        onClose={
          closeReview
        }
        onSubmit={() =>
          void submitReview()
        }
      />
    </SafeAreaView>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon:
    | "people-outline"
    | "time-outline";

  label: string;
  value: number;
}) {
  return (
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
          name={icon}
          size={21}
          color="#4f46e5"
        />
      </View>

      <Text
        style={
          styles.summaryValue
        }
      >
        {value}
      </Text>

      <Text
        style={
          styles.summaryLabel
        }
      >
        {label}
      </Text>
    </View>
  );
}

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={
        onPress
      }
      style={[
        styles.filterChip,

        selected &&
          styles.filterChipSelected,
      ]}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.filterChipText,

          selected &&
            styles.filterChipTextSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function RequestCard({
  item,
  onApprove,
  onReject,
}: {
  item: RequestWithGroup;

  onApprove: () => void;

  onReject: () => void;
}) {
  const user =
    getRequestUser(
      item.request.user
    );

  return (
    <View
      style={
        styles.requestCard
      }
    >
      <View
        style={
          styles.requestTop
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
            styles.userArea
          }
        >
          <Text
            style={
              styles.userName
            }
          >
            {user.fullName}
          </Text>

          <Text
            style={
              styles.userEmail
            }
          >
            {user.email}
          </Text>
        </View>

        <View
          style={
            styles.pendingBadge
          }
        >
          <Ionicons
            name="time-outline"
            size={12}
            color="#c2410c"
          />

          <Text
            style={
              styles.pendingText
            }
          >
            Pending
          </Text>
        </View>
      </View>

      <View
        style={
          styles.groupTag
        }
      >
        <Ionicons
          name="people-outline"
          size={15}
          color="#4f46e5"
        />

        <Text
          numberOfLines={1}
          style={
            styles.groupTagText
          }
        >
          {
            item.group.name
          }
        </Text>
      </View>

      <Text
        style={
          styles.reasonLabel
        }
      >
        Reason for joining
      </Text>

      <Text
        style={
          styles.reasonText
        }
      >
        {
          item.request
            .reason
        }
      </Text>

      <Text
        style={
          styles.requestDate
        }
      >
        Requested{" "}
        {formatDate(
          item.request
            .createdAt
        )}
      </Text>

      <View
        style={
          styles.actions
        }
      >
        <Pressable
          onPress={
            onReject
          }
          style={({
            pressed,
          }) => [
            styles.rejectButton,

            pressed && {
              opacity: 0.8,
            },
          ]}
        >
          <Ionicons
            name="close-outline"
            size={19}
            color="#b91c1c"
          />

          <Text
            style={
              styles.rejectButtonText
            }
          >
            Reject
          </Text>
        </Pressable>

        <Pressable
          onPress={
            onApprove
          }
          style={({
            pressed,
          }) => [
            styles.approveButton,

            pressed && {
              opacity: 0.82,
            },
          ]}
        >
          <Ionicons
            name="checkmark-outline"
            size={19}
            color="#ffffff"
          />

          <Text
            style={
              styles.approveButtonText
            }
          >
            Approve
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon:
    | "people-outline"
    | "checkmark-circle-outline";

  title: string;
  description: string;
}) {
  return (
    <View
      style={
        styles.emptyCard
      }
    >
      <View
        style={
          styles.emptyIcon
        }
      >
        <Ionicons
          name={icon}
          size={30}
          color="#94a3b8"
        />
      </View>

      <Text
        style={
          styles.emptyTitle
        }
      >
        {title}
      </Text>

      <Text
        style={
          styles.emptyDescription
        }
      >
        {description}
      </Text>
    </View>
  );
}

function ReviewModal({
  selectedReview,
  reviewNote,
  error,
  processing,
  onReviewNoteChange,
  onClose,
  onSubmit,
}: {
  selectedReview:
    | SelectedReview
    | null;

  reviewNote: string;

  error:
    | string
    | null;

  processing: boolean;

  onReviewNoteChange: (
    value: string
  ) => void;

  onClose: () => void;

  onSubmit: () => void;
}) {
  if (
    !selectedReview
  ) {
    return null;
  }

  const approving =
    selectedReview.action ===
    "APPROVE";

  const user =
    getRequestUser(
      selectedReview.item
        .request.user
    );

  return (
    <Modal
      visible
      transparent
      animationType="slide"
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
              styles.modalContainer
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
                  {approving
                    ? "Approve Request"
                    : "Reject Request"}
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  {user.fullName} •{" "}
                  {
                    selectedReview
                      .item.group
                      .name
                  }
                </Text>
              </View>

              <Pressable
                disabled={
                  processing
                }
                hitSlop={10}
                onPress={
                  onClose
                }
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
              contentContainerStyle={
                styles.modalContent
              }
            >
              <View
                style={[
                  styles.confirmBox,

                  approving
                    ? styles.approveConfirmBox
                    : styles.rejectConfirmBox,
                ]}
              >
                <Ionicons
                  name={
                    approving
                      ? "checkmark-circle-outline"
                      : "close-circle-outline"
                  }
                  size={24}
                  color={
                    approving
                      ? "#047857"
                      : "#b91c1c"
                  }
                />

                <Text
                  style={
                    styles.confirmText
                  }
                >
                  {approving
                    ? "Approving this request will create an active group membership for this user."
                    : "Rejecting this request will not create a group membership."}
                </Text>
              </View>

              <Text
                style={
                  styles.noteLabel
                }
              >
                Review Note
                (Optional)
              </Text>

              <TextInput
                value={
                  reviewNote
                }
                onChangeText={
                  onReviewNoteChange
                }
                editable={
                  !processing
                }
                multiline
                maxLength={500}
                textAlignVertical="top"
                placeholder={
                  approving
                    ? "Optional message for the member..."
                    : "Optional reason for rejection..."
                }
                placeholderTextColor="#94a3b8"
                style={
                  styles.noteInput
                }
              />

              <Text
                style={
                  styles.characterCount
                }
              >
                {reviewNote.length}
                /500
              </Text>

              {error && (
                <View
                  style={
                    styles.reviewErrorBox
                  }
                >
                  <Text
                    style={
                      styles.reviewErrorText
                    }
                  >
                    {error}
                  </Text>
                </View>
              )}

              <Pressable
                disabled={
                  processing
                }
                onPress={
                  onSubmit
                }
                style={[
                  styles.confirmButton,

                  approving
                    ? styles.confirmApproveButton
                    : styles.confirmRejectButton,

                  processing && {
                    opacity: 0.65,
                  },
                ]}
              >
                {processing ? (
                  <ActivityIndicator
                    color="#ffffff"
                  />
                ) : (
                  <>
                    <Ionicons
                      name={
                        approving
                          ? "checkmark-outline"
                          : "close-outline"
                      }
                      size={21}
                      color="#ffffff"
                    />

                    <Text
                      style={
                        styles.confirmButtonText
                      }
                    >
                      {approving
                        ? "Approve Membership"
                        : "Reject Request"}
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

function getRequestUser(
  value:
    | string
    | JoinRequestUser
) {
  if (
    typeof value ===
    "string"
  ) {
    return {
      fullName:
        "User",

      email:
        "User ID: " +
        value,
    };
  }

  return {
    fullName:
      value.fullName ??
      "User",

    email:
      value.email ??
      "",
  };
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

  return `${parts[0][0]}${
    parts[
      parts.length - 1
    ][0]
  }`.toUpperCase();
}

function formatDate(
  value: string
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
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

    headingDescription: {
      marginTop: 6,

      fontSize: 14,

      lineHeight: 21,

      color: "#64748b",
    },

    summaryRow: {
      marginTop: 20,

      flexDirection:
        "row",

      gap: 12,
    },

    summaryCard: {
      flex: 1,

      padding: 15,

      borderWidth: 1,

      borderColor:
        "#e2e8f0",

      borderRadius: 18,

      backgroundColor:
        "#ffffff",
    },

    summaryIcon: {
      width: 38,

      height: 38,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 12,

      backgroundColor:
        "#eef2ff",
    },

    summaryValue: {
      marginTop: 10,

      fontSize: 24,

      fontWeight: "800",

      color: "#0f172a",
    },

    summaryLabel: {
      marginTop: 2,

      fontSize: 11,

      color: "#64748b",
    },

    filterSection: {
      marginTop: 20,
    },

    filterTitle: {
      marginBottom: 9,

      fontSize: 13,

      fontWeight: "700",

      color: "#334155",
    },

    filterChip: {
      maxWidth: 180,

      marginRight: 8,

      paddingHorizontal: 13,

      paddingVertical: 9,

      borderWidth: 1,

      borderColor:
        "#e2e8f0",

      borderRadius: 999,

      backgroundColor:
        "#ffffff",
    },

    filterChipSelected: {
      borderColor:
        "#c7d2fe",

      backgroundColor:
        "#eef2ff",
    },

    filterChipText: {
      fontSize: 12,

      fontWeight: "600",

      color: "#64748b",
    },

    filterChipTextSelected: {
      color: "#4f46e5",
    },

    errorBox: {
      marginTop: 16,

      padding: 14,

      flexDirection:
        "row",

      borderWidth: 1,

      borderColor:
        "#fecaca",

      borderRadius: 14,

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

    emptyCard: {
      marginTop: 24,

      paddingVertical: 50,

      paddingHorizontal:
        22,

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        "#e2e8f0",

      borderRadius: 20,

      backgroundColor:
        "#ffffff",
    },

    emptyIcon: {
      width: 60,

      height: 60,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 30,

      backgroundColor:
        "#f1f5f9",
    },

    emptyTitle: {
      marginTop: 13,

      fontSize: 17,

      fontWeight: "700",

      color: "#475569",
    },

    emptyDescription: {
      marginTop: 6,

      textAlign:
        "center",

      fontSize: 12,

      lineHeight: 18,

      color: "#94a3b8",
    },

    requestList: {
      marginTop: 18,
    },

    requestCard: {
      marginBottom: 14,

      padding: 17,

      borderWidth: 1,

      borderColor:
        "#e2e8f0",

      borderRadius: 20,

      backgroundColor:
        "#ffffff",
    },

    requestTop: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    avatar: {
      width: 45,

      height: 45,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 23,

      backgroundColor:
        "#eef2ff",
    },

    avatarText: {
      fontSize: 13,

      fontWeight: "800",

      color: "#4f46e5",
    },

    userArea: {
      flex: 1,

      marginLeft: 10,

      paddingRight: 6,
    },

    userName: {
      fontSize: 15,

      fontWeight: "800",

      color: "#0f172a",
    },

    userEmail: {
      marginTop: 2,

      fontSize: 11,

      color: "#64748b",
    },

    pendingBadge: {
      paddingHorizontal: 8,

      paddingVertical: 5,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderRadius: 999,

      backgroundColor:
        "#fff7ed",
    },

    pendingText: {
      marginLeft: 3,

      fontSize: 10,

      fontWeight: "800",

      color: "#c2410c",
    },

    groupTag: {
      alignSelf:
        "flex-start",

      maxWidth: "100%",

      marginTop: 13,

      paddingHorizontal: 9,

      paddingVertical: 6,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderRadius: 10,

      backgroundColor:
        "#eef2ff",
    },

    groupTagText: {
      marginLeft: 5,

      fontSize: 11,

      fontWeight: "700",

      color: "#4f46e5",
    },

    reasonLabel: {
      marginTop: 15,

      fontSize: 12,

      fontWeight: "700",

      color: "#334155",
    },

    reasonText: {
      marginTop: 5,

      fontSize: 14,

      lineHeight: 21,

      color: "#475569",
    },

    requestDate: {
      marginTop: 10,

      fontSize: 10,

      color: "#94a3b8",
    },

    actions: {
      marginTop: 16,

      paddingTop: 14,

      flexDirection:
        "row",

      gap: 10,

      borderTopWidth: 1,

      borderTopColor:
        "#f1f5f9",
    },

    rejectButton: {
      flex: 1,

      minHeight: 45,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        "#fecaca",

      borderRadius: 13,

      backgroundColor:
        "#fef2f2",
    },

    rejectButtonText: {
      marginLeft: 5,

      fontWeight: "800",

      color: "#b91c1c",
    },

    approveButton: {
      flex: 1,

      minHeight: 45,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 13,

      backgroundColor:
        "#4f46e5",
    },

    approveButtonText: {
      marginLeft: 5,

      fontWeight: "800",

      color: "#ffffff",
    },

    modalOverlay: {
      flex: 1,

      justifyContent:
        "flex-end",

      backgroundColor:
        "rgba(15, 23, 42, 0.45)",
    },

    modalContainer: {
      maxHeight: "80%",

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

      paddingTop: 20,

      paddingBottom: 15,

      flexDirection:
        "row",

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

      fontSize: 12,

      color: "#64748b",
    },

    modalContent: {
      padding: 20,

      paddingBottom: 40,
    },

    confirmBox: {
      padding: 14,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      borderWidth: 1,

      borderRadius: 15,
    },

    approveConfirmBox: {
      borderColor:
        "#a7f3d0",

      backgroundColor:
        "#ecfdf5",
    },

    rejectConfirmBox: {
      borderColor:
        "#fecaca",

      backgroundColor:
        "#fef2f2",
    },

    confirmText: {
      flex: 1,

      marginLeft: 9,

      fontSize: 12,

      lineHeight: 18,

      color: "#475569",
    },

    noteLabel: {
      marginTop: 20,

      marginBottom: 8,

      fontSize: 14,

      fontWeight: "700",

      color: "#334155",
    },

    noteInput: {
      minHeight: 120,

      padding: 14,

      borderWidth: 1,

      borderColor:
        "#cbd5e1",

      borderRadius: 15,

      fontSize: 14,

      lineHeight: 20,

      color: "#0f172a",
    },

    characterCount: {
      marginTop: 5,

      textAlign:
        "right",

      fontSize: 11,

      color: "#94a3b8",
    },

    reviewErrorBox: {
      marginTop: 12,

      padding: 12,

      borderWidth: 1,

      borderColor:
        "#fecaca",

      borderRadius: 12,

      backgroundColor:
        "#fef2f2",
    },

    reviewErrorText: {
      color: "#b91c1c",
    },

    confirmButton: {
      minHeight: 54,

      marginTop: 20,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 16,
    },

    confirmApproveButton: {
      backgroundColor:
        "#4f46e5",
    },

    confirmRejectButton: {
      backgroundColor:
        "#dc2626",
    },

    confirmButtonText: {
      marginLeft: 7,

      fontWeight: "800",

      color: "#ffffff",
    },
  });