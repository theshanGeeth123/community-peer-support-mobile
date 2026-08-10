import {
    useCallback,
    useState,
} from "react";

import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
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
} from "@/features/groups/types/groupMembership.types";

import {
    getApiErrorMessage,
} from "@/services/api/apiError";

export default function UserGroupDetailsScreen() {
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
    group,
    setGroup,
  ] =
    useState<
      SupportGroup | null
    >(null);

  const [
    latestRequest,
    setLatestRequest,
  ] =
    useState<
      GroupJoinRequest | null
    >(null);

  const [
    membershipActive,
    setMembershipActive,
  ] =
    useState(false);

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
    requestModalVisible,
    setRequestModalVisible,
  ] =
    useState(false);

  const [
    reason,
    setReason,
  ] =
    useState("");

  const [
    requestError,
    setRequestError,
  ] =
    useState<string | null>(
      null
    );

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const loadDetails =
    useCallback(
      async () => {
        if (!groupId) {
          setError(
            "Invalid support group."
          );

          setLoading(
            false
          );

          return;
        }

        try {
          setLoading(true);

          setError(null);

          const [
            groupResponse,
            requestsResponse,
            membershipsResponse,
          ] =
            await Promise.all([
              groupApi.getGroup(
                groupId
              ),

              groupMembershipApi.getMyJoinRequests(),

              groupMembershipApi.getMyJoinedGroups(),
            ]);

          setGroup(
            groupResponse
              .data.group
          );

          const requests =
            requestsResponse
              .data.requests ??
            [];

          const currentRequest =
            requests.find(
              (request) =>
                getGroupReferenceId(
                  request.group
                ) ===
                groupId
            ) ?? null;

          setLatestRequest(
            currentRequest
          );

          const memberships =
            membershipsResponse
              .data
              .memberships ??
            [];

          const isMember =
            memberships.some(
              (
                membership: GroupMembership
              ) =>
                membership.status ===
                  "ACTIVE" &&
                getGroupReferenceId(
                  membership.group
                ) ===
                  groupId
            );

          setMembershipActive(
            isMember
          );
        } catch (
          requestErrorValue
        ) {
          setError(
            getApiErrorMessage(
              requestErrorValue
            )
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [groupId]
    );

  useFocusEffect(
    useCallback(() => {
      void loadDetails();

      return undefined;
    }, [loadDetails])
  );

  const openRequestModal =
    () => {
      setReason("");

      setRequestError(
        null
      );

      setRequestModalVisible(
        true
      );
    };

  const closeRequestModal =
    () => {
      if (submitting) {
        return;
      }

      setRequestModalVisible(
        false
      );

      setReason("");

      setRequestError(
        null
      );
    };

  const submitJoinRequest =
    async () => {
      if (!groupId) {
        return;
      }

      const cleanReason =
        reason.trim();

      if (
        cleanReason.length <
        10
      ) {
        setRequestError(
          "Please enter at least 10 characters explaining why you would like to join."
        );

        return;
      }

      if (
        cleanReason.length >
        500
      ) {
        setRequestError(
          "Join reason cannot exceed 500 characters."
        );

        return;
      }

      try {
        setSubmitting(
          true
        );

        setRequestError(
          null
        );

        const response =
          await groupMembershipApi.requestToJoinGroup(
            groupId,
            {
              reason:
                cleanReason,
            }
          );

        setLatestRequest(
          response.data
            .joinRequest
        );

        setRequestModalVisible(
          false
        );

        setReason("");
      } catch (
        requestErrorValue
      ) {
        setRequestError(
          getApiErrorMessage(
            requestErrorValue
          )
        );
      } finally {
        setSubmitting(
          false
        );
      }
    };

  if (loading) {
    return (
      <SafeAreaView
        style={
          styles.safeArea
        }
      >
        <View
          style={
            styles.centerArea
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
            Loading group...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (
    error ||
    !group
  ) {
    return (
      <SafeAreaView
        style={
          styles.safeArea
        }
      >
        <View
          style={
            styles.errorPage
          }
        >
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color="#dc2626"
          />

          <Text
            style={
              styles.errorPageTitle
            }
          >
            Unable to load
            group
          </Text>

          <Text
            style={
              styles.errorPageText
            }
          >
            {error ??
              "Support group was not found."}
          </Text>

          <Pressable
            style={
              styles.backButtonLarge
            }
            onPress={() =>
              router.back()
            }
          >
            <Text
              style={
                styles.backButtonLargeText
              }
            >
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const pending =
    latestRequest?.status ===
    "PENDING";

  const rejected =
    latestRequest?.status ===
    "REJECTED";

  const approved =
    membershipActive ||
    latestRequest?.status ===
      "APPROVED";

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

        <Text
          numberOfLines={1}
          style={
            styles.headerTitle
          }
        >
          Group Details
        </Text>

        <View
          style={{
            width: 42,
          }}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        <View
          style={
            styles.hero
          }
        >
          <View
            style={
              styles.heroIcon
            }
          >
            <Ionicons
              name="people"
              size={34}
              color="#4f46e5"
            />
          </View>

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
        </View>

        {approved && (
          <StatusMessage
            type="success"
            title="Membership Active"
            description="Your join request has been approved. You are now a member of this support group."
          />
        )}

        {pending && (
          <StatusMessage
            type="pending"
            title="Request Pending"
            description="Your request has been sent to the assigned Peer Supporter for review."
          />
        )}

        {rejected && (
          <StatusMessage
            type="error"
            title="Previous Request Rejected"
            description={
              latestRequest
                ?.reviewNote
                ? latestRequest.reviewNote
                : "Your previous request was not approved. You can submit another request if appropriate."
            }
          />
        )}

        <InfoSection
          title="About This Group"
          icon="information-circle-outline"
        >
          <Text
            style={
              styles.bodyText
            }
          >
            {
              group.description
            }
          </Text>
        </InfoSection>

        <InfoSection
          title="Support Team"
          icon="heart-outline"
        >
          <View
            style={
              styles.teamRow
            }
          >
            <View
              style={
                styles.teamIcon
              }
            >
              <Ionicons
                name="heart-outline"
                size={20}
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
                  styles.teamTitle
                }
              >
                Peer Supporters
              </Text>

              <Text
                style={
                  styles.teamDescription
                }
              >
                {
                  group
                    .peerSupporters
                    .length
                }{" "}
                assigned to this
                group
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.teamRow,
              {
                marginTop: 10,
              },
            ]}
          >
            <View
              style={
                styles.teamIcon
              }
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
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
                  styles.teamTitle
                }
              >
                Moderators
              </Text>

              <Text
                style={
                  styles.teamDescription
                }
              >
                {
                  group
                    .moderators
                    .length
                }{" "}
                assigned to this
                group
              </Text>
            </View>
          </View>
        </InfoSection>

        <InfoSection
          title="Group Rules"
          icon="document-text-outline"
        >
          {group.rules.length ===
          0 ? (
            <Text
              style={
                styles.mutedText
              }
            >
              No specific group
              rules have been
              added yet.
            </Text>
          ) : (
            group.rules.map(
              (
                rule,
                index
              ) => (
                <View
                  key={`${rule}-${index}`}
                  style={
                    styles.ruleRow
                  }
                >
                  <View
                    style={
                      styles.ruleNumber
                    }
                  >
                    <Text
                      style={
                        styles.ruleNumberText
                      }
                    >
                      {index +
                        1}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.ruleText
                    }
                  >
                    {rule}
                  </Text>
                </View>
              )
            )
          )}
        </InfoSection>

        {!approved &&
          !pending && (
            <Pressable
              onPress={
                openRequestModal
              }
              style={({
                pressed,
              }) => [
                styles.requestButton,

                pressed && {
                  opacity: 0.85,
                },
              ]}
            >
              <Ionicons
                name="person-add-outline"
                size={21}
                color="#ffffff"
              />

              <Text
                style={
                  styles.requestButtonText
                }
              >
                {rejected
                  ? "Request to Join Again"
                  : "Request to Join"}
              </Text>
            </Pressable>
          )}

        {pending && (
          <View
            style={
              styles.disabledButton
            }
          >
            <Ionicons
              name="time-outline"
              size={21}
              color="#92400e"
            />

            <Text
              style={
                styles.disabledButtonText
              }
            >
              Awaiting Review
            </Text>
          </View>
        )}

        {approved && (
          <View
            style={
              styles.joinedButton
            }
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={22}
              color="#047857"
            />

            <Text
              style={
                styles.joinedButtonText
              }
            >
              You are a member
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={
          requestModalVisible
        }
        transparent
        animationType="slide"
        onRequestClose={
          closeRequestModal
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
                closeRequestModal
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
                    Request to Join
                  </Text>

                  <Text
                    style={
                      styles.modalSubtitle
                    }
                  >
                    {group.name}
                  </Text>
                </View>

                <Pressable
                  disabled={
                    submitting
                  }
                  onPress={
                    closeRequestModal
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
                contentContainerStyle={
                  styles.modalContent
                }
              >
                <View
                  style={
                    styles.privacyNotice
                  }
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={19}
                    color="#4f46e5"
                  />

                  <Text
                    style={
                      styles.privacyText
                    }
                  >
                    Your join
                    reason will be
                    reviewed by the
                    Peer Supporter
                    assigned to
                    this group.
                  </Text>
                </View>

                <Text
                  style={
                    styles.inputLabel
                  }
                >
                  Why would you
                  like to join? *
                </Text>

                <TextInput
                  value={reason}
                  onChangeText={
                    setReason
                  }
                  editable={
                    !submitting
                  }
                  multiline
                  textAlignVertical="top"
                  maxLength={500}
                  placeholder="Briefly explain why this support group would be helpful for you..."
                  placeholderTextColor="#94a3b8"
                  style={
                    styles.reasonInput
                  }
                />

                <Text
                  style={
                    styles.characterCount
                  }
                >
                  {
                    reason.length
                  }
                  /500
                </Text>

                {requestError && (
                  <View
                    style={
                      styles.requestError
                    }
                  >
                    <Text
                      style={
                        styles.requestErrorText
                      }
                    >
                      {
                        requestError
                      }
                    </Text>
                  </View>
                )}

                <Pressable
                  disabled={
                    submitting
                  }
                  onPress={() =>
                    void submitJoinRequest()
                  }
                  style={[
                    styles.submitButton,

                    submitting && {
                      opacity:
                        0.65,
                    },
                  ]}
                >
                  {submitting ? (
                    <ActivityIndicator
                      color="#ffffff"
                    />
                  ) : (
                    <>
                      <Ionicons
                        name="send-outline"
                        size={20}
                        color="#ffffff"
                      />

                      <Text
                        style={
                          styles.submitButtonText
                        }
                      >
                        Send Request
                      </Text>
                    </>
                  )}
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function InfoSection({
  title,
  icon,
  children,
}: {
  title: string;

  icon:
    | "information-circle-outline"
    | "heart-outline"
    | "document-text-outline";

  children:
    React.ReactNode;
}) {
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
        <Ionicons
          name={icon}
          size={20}
          color="#4f46e5"
        />

        <Text
          style={
            styles.sectionTitle
          }
        >
          {title}
        </Text>
      </View>

      {children}
    </View>
  );
}

function StatusMessage({
  type,
  title,
  description,
}: {
  type:
    | "success"
    | "pending"
    | "error";

  title: string;
  description: string;
}) {
  const config = {
    success: {
      background:
        "#ecfdf5",

      border:
        "#a7f3d0",

      text:
        "#047857",

      icon:
        "checkmark-circle-outline" as const,
    },

    pending: {
      background:
        "#fff7ed",

      border:
        "#fed7aa",

      text:
        "#c2410c",

      icon:
        "time-outline" as const,
    },

    error: {
      background:
        "#fef2f2",

      border:
        "#fecaca",

      text:
        "#b91c1c",

      icon:
        "close-circle-outline" as const,
    },
  }[type];

  return (
    <View
      style={[
        styles.statusMessage,

        {
          backgroundColor:
            config.background,

          borderColor:
            config.border,
        },
      ]}
    >
      <Ionicons
        name={
          config.icon
        }
        size={23}
        color={
          config.text
        }
      />

      <View
        style={{
          flex: 1,
          marginLeft: 10,
        }}
      >
        <Text
          style={[
            styles.statusMessageTitle,

            {
              color:
                config.text,
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={
            styles.statusMessageDescription
          }
        >
          {description}
        </Text>
      </View>
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

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        "#f8fafc",
    },

    centerArea: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    loadingText: {
      marginTop: 12,
      color: "#64748b",
    },

    header: {
      height: 62,

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

    headerTitle: {
      flex: 1,

      marginHorizontal:
        10,

      textAlign:
        "center",

      fontSize: 17,

      fontWeight:
        "800",

      color: "#0f172a",
    },

    content: {
      padding: 20,
      paddingBottom: 70,
    },

    hero: {
      alignItems:
        "center",

      paddingVertical:
        25,

      paddingHorizontal:
        20,

      borderRadius: 22,

      borderWidth: 1,

      borderColor:
        "#e2e8f0",

      backgroundColor:
        "#ffffff",
    },

    heroIcon: {
      width: 70,
      height: 70,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 35,

      backgroundColor:
        "#eef2ff",
    },

    groupName: {
      marginTop: 15,

      textAlign:
        "center",

      fontSize: 23,

      fontWeight:
        "800",

      color: "#0f172a",
    },

    category: {
      marginTop: 5,

      fontSize: 13,

      fontWeight:
        "700",

      color: "#6366f1",
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
      color: "#64748b",
    },

    statusMessage: {
      marginTop: 15,

      padding: 14,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      borderWidth: 1,

      borderRadius: 16,
    },

    statusMessageTitle: {
      fontWeight:
        "800",
    },

    statusMessageDescription: {
      marginTop: 4,

      fontSize: 12,

      lineHeight: 18,

      color: "#64748b",
    },

    section: {
      marginTop: 15,

      padding: 17,

      borderRadius: 20,

      borderWidth: 1,

      borderColor:
        "#e2e8f0",

      backgroundColor:
        "#ffffff",
    },

    sectionHeader: {
      marginBottom: 12,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    sectionTitle: {
      marginLeft: 7,

      fontSize: 16,

      fontWeight:
        "800",

      color: "#0f172a",
    },

    bodyText: {
      fontSize: 14,

      lineHeight: 22,

      color: "#475569",
    },

    mutedText: {
      lineHeight: 20,
      color: "#64748b",
    },

    teamRow: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    teamIcon: {
      width: 42,
      height: 42,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 14,

      backgroundColor:
        "#eef2ff",
    },

    teamTitle: {
      marginLeft: 10,
      fontWeight:
        "700",
      color: "#334155",
    },

    teamDescription: {
      marginTop: 2,
      marginLeft: 10,
      fontSize: 12,
      color: "#64748b",
    },

    ruleRow: {
      marginBottom: 11,

      flexDirection:
        "row",

      alignItems:
        "flex-start",
    },

    ruleNumber: {
      width: 25,
      height: 25,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 13,

      backgroundColor:
        "#eef2ff",
    },

    ruleNumberText: {
      fontSize: 11,

      fontWeight:
        "800",

      color: "#4f46e5",
    },

    ruleText: {
      flex: 1,

      marginLeft: 9,

      paddingTop: 2,

      lineHeight: 20,

      color: "#475569",
    },

    requestButton: {
      minHeight: 55,

      marginTop: 20,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 17,

      backgroundColor:
        "#4f46e5",
    },

    requestButtonText: {
      marginLeft: 8,

      fontSize: 15,

      fontWeight:
        "800",

      color: "#ffffff",
    },

    disabledButton: {
      minHeight: 55,

      marginTop: 20,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 17,

      borderWidth: 1,

      borderColor:
        "#fed7aa",

      backgroundColor:
        "#fff7ed",
    },

    disabledButtonText: {
      marginLeft: 8,

      fontWeight:
        "800",

      color: "#92400e",
    },

    joinedButton: {
      minHeight: 55,

      marginTop: 20,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 17,

      borderWidth: 1,

      borderColor:
        "#a7f3d0",

      backgroundColor:
        "#ecfdf5",
    },

    joinedButtonText: {
      marginLeft: 8,

      fontWeight:
        "800",

      color: "#047857",
    },

    errorPage: {
      flex: 1,

      padding: 30,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    errorPageTitle: {
      marginTop: 15,

      fontSize: 20,

      fontWeight:
        "800",

      color: "#0f172a",
    },

    errorPageText: {
      marginTop: 8,

      textAlign:
        "center",

      lineHeight: 20,

      color: "#64748b",
    },

    backButtonLarge: {
      marginTop: 20,

      paddingHorizontal:
        25,

      paddingVertical:
        13,

      borderRadius: 14,

      backgroundColor:
        "#4f46e5",
    },

    backButtonLargeText: {
      fontWeight:
        "700",

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

      fontWeight:
        "800",

      color: "#0f172a",
    },

    modalSubtitle: {
      marginTop: 3,
      fontSize: 13,
      color: "#64748b",
    },

    modalContent: {
      padding: 20,
      paddingBottom: 40,
    },

    privacyNotice: {
      padding: 13,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      borderRadius: 14,

      backgroundColor:
        "#eef2ff",
    },

    privacyText: {
      flex: 1,

      marginLeft: 8,

      fontSize: 12,

      lineHeight: 18,

      color: "#4338ca",
    },

    inputLabel: {
      marginTop: 20,

      marginBottom: 8,

      fontSize: 14,

      fontWeight:
        "700",

      color: "#334155",
    },

    reasonInput: {
      minHeight: 140,

      padding: 14,

      borderWidth: 1,

      borderColor:
        "#cbd5e1",

      borderRadius: 15,

      fontSize: 15,

      lineHeight: 21,

      color: "#0f172a",

      backgroundColor:
        "#ffffff",
    },

    characterCount: {
      marginTop: 5,

      textAlign:
        "right",

      fontSize: 11,

      color: "#94a3b8",
    },

    requestError: {
      marginTop: 12,

      padding: 12,

      borderWidth: 1,

      borderColor:
        "#fecaca",

      borderRadius: 12,

      backgroundColor:
        "#fef2f2",
    },

    requestErrorText: {
      lineHeight: 18,
      color: "#b91c1c",
    },

    submitButton: {
      minHeight: 54,

      marginTop: 20,

      flexDirection:
        "row",

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

      fontWeight:
        "800",

      color: "#ffffff",
    },
  });