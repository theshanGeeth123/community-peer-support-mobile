import { useThemeTone, useThemedStyles } from '@/theme/useAlyvenAppearance';
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
  const themeStyles = useThemedStyles(styles);
  const themeTone = useThemeTone();

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

  const [
    redirecting,
    setRedirecting,
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

          if (isMember) {
            setRedirecting(true);

            router.replace({
              pathname:
                "/(app)/user/group/[groupId]/posts",

              params: {
                groupId,
              },
            });

            return;
          }
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

  if (loading || redirecting) {
    return (
      <SafeAreaView
        style={
          themeStyles.safeArea
        }
      >
        <View
          style={
            themeStyles.centerArea
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
            {redirecting
              ? "Opening group..."
              : "Loading group..."}
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
          themeStyles.safeArea
        }
      >
        <View
          style={
            themeStyles.errorPage
          }
        >
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={themeTone("#dc2626", "color")}
          />

          <Text
            style={
              themeStyles.errorPageTitle
            }
          >
            Unable to load
            group
          </Text>

          <Text
            style={
              themeStyles.errorPageText
            }
          >
            {error ??
              "Support group was not found."}
          </Text>

          <Pressable
            style={
              themeStyles.backButtonLarge
            }
            onPress={() =>
              router.back()
            }
          >
            <Text
              style={
                themeStyles.backButtonLargeText
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
        themeStyles.safeArea
      }
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      <View
        style={
          themeStyles.header
        }
      >
        <Pressable
          onPress={() =>
            router.back()
          }
          style={
            themeStyles.backButton
          }
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={themeTone("#0E2A47", "color")}
          />
        </Pressable>

        <Text
          numberOfLines={1}
          style={
            themeStyles.headerTitle
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
          themeStyles.content
        }
      >
        <View
          style={
            themeStyles.hero
          }
        >
          <View
            style={
              themeStyles.heroIcon
            }
          >
            <Ionicons
              name="people"
              size={34}
              color={themeTone("#0E7C86", "color")}
            />
          </View>

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
        </View>

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
              themeStyles.bodyText
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
              themeStyles.teamRow
            }
          >
            <View
              style={
                themeStyles.teamIcon
              }
            >
              <Ionicons
                name="heart-outline"
                size={20}
                color={themeTone("#0E7C86", "color")}
              />
            </View>

            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={
                  themeStyles.teamTitle
                }
              >
                Peer Supporters
              </Text>

              <Text
                style={
                  themeStyles.teamDescription
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
              themeStyles.teamRow,
              {
                marginTop: 10,
              },
            ]}
          >
            <View
              style={
                themeStyles.teamIcon
              }
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={themeTone("#0E7C86", "color")}
              />
            </View>

            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={
                  themeStyles.teamTitle
                }
              >
                Moderators
              </Text>

              <Text
                style={
                  themeStyles.teamDescription
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
                themeStyles.mutedText
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
                    themeStyles.ruleRow
                  }
                >
                  <View
                    style={
                      themeStyles.ruleNumber
                    }
                  >
                    <Text
                      style={
                        themeStyles.ruleNumberText
                      }
                    >
                      {index +
                        1}
                    </Text>
                  </View>

                  <Text
                    style={
                      themeStyles.ruleText
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
                themeStyles.requestButton,

                pressed && {
                  opacity: 0.85,
                },
              ]}
            >
              <Ionicons
                name="person-add-outline"
                size={21}
                color={themeTone("#ffffff", "color")}
              />

              <Text
                style={
                  themeStyles.requestButtonText
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
              themeStyles.disabledButton
            }
          >
            <Ionicons
              name="time-outline"
              size={21}
              color={themeTone("#92400e", "color")}
            />

            <Text
              style={
                themeStyles.disabledButtonText
              }
            >
              Awaiting Review
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
              themeStyles.modalOverlay
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
                themeStyles.modalContainer
              }
            >
              <View
                style={
                  themeStyles.modalHeader
                }
              >
                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={
                      themeStyles.modalTitle
                    }
                  >
                    Request to Join
                  </Text>

                  <Text
                    style={
                      themeStyles.modalSubtitle
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
                    color={themeTone("#4D6C78", "color")}
                  />
                </Pressable>
              </View>

              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={
                  themeStyles.modalContent
                }
              >
                <View
                  style={
                    themeStyles.privacyNotice
                  }
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={19}
                    color={themeTone("#0E7C86", "color")}
                  />

                  <Text
                    style={
                      themeStyles.privacyText
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
                    themeStyles.inputLabel
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
                  placeholderTextColor={themeTone("#8BA3AB", "placeholderTextColor")}
                  style={
                    themeStyles.reasonInput
                  }
                />

                <Text
                  style={
                    themeStyles.characterCount
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
                      themeStyles.requestError
                    }
                  >
                    <Text
                      style={
                        themeStyles.requestErrorText
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
                    themeStyles.submitButton,

                    submitting && {
                      opacity:
                        0.65,
                    },
                  ]}
                >
                  {submitting ? (
                    <ActivityIndicator
                      color={themeTone("#ffffff", "color")}
                    />
                  ) : (
                    <>
                      <Ionicons
                        name="send-outline"
                        size={20}
                        color={themeTone("#ffffff", "color")}
                      />

                      <Text
                        style={
                          themeStyles.submitButtonText
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
  const themeStyles = useThemedStyles(styles);
  const themeTone = useThemeTone();

  return (
    <View
      style={
        themeStyles.section
      }
    >
      <View
        style={
          themeStyles.sectionHeader
        }
      >
        <Ionicons
          name={icon}
          size={20}
          color={themeTone("#0E7C86", "color")}
        />

        <Text
          style={
            themeStyles.sectionTitle
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
  const themeStyles = useThemedStyles(styles);

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
        themeStyles.statusMessage,

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
            themeStyles.statusMessageTitle,

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
            themeStyles.statusMessageDescription
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
        "#F5FAF9",
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
      color: "#64808C",
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
        "#E0EDEB",

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
        "#EDF5F4",
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

      color: "#0E2A47",
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
        "#E0EDEB",

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
        "#EAF8F5",
    },

    groupName: {
      marginTop: 15,

      textAlign:
        "center",

      fontSize: 23,

      fontWeight:
        "800",

      color: "#0E2A47",
    },

    category: {
      marginTop: 5,

      fontSize: 13,

      fontWeight:
        "700",

      color: "#168994",
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
      color: "#64808C",
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

      color: "#64808C",
    },

    postsButton: {
      minHeight: 66,

      marginTop: 15,

      paddingHorizontal: 14,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

      borderColor: "#B7E7DA",

      borderRadius: 18,

      backgroundColor: "#EAF8F5",
    },

    postsButtonIcon: {
      width: 40,
      height: 40,

      alignItems: "center",

      justifyContent: "center",

      borderRadius: 13,

      backgroundColor: "#ffffff",
    },

    postsButtonTitle: {
      fontSize: 15,

      fontWeight: "800",

      color: "#0E2A47",
    },

    postsButtonDescription: {
      marginTop: 2,

      fontSize: 11,

      color: "#64808C",
    },

    section: {
      marginTop: 15,

      padding: 17,

      borderRadius: 20,

      borderWidth: 1,

      borderColor:
        "#E0EDEB",

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

      color: "#0E2A47",
    },

    bodyText: {
      fontSize: 14,

      lineHeight: 22,

      color: "#4D6C78",
    },

    mutedText: {
      lineHeight: 20,
      color: "#64808C",
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
        "#EAF8F5",
    },

    teamTitle: {
      marginLeft: 10,
      fontWeight:
        "700",
      color: "#31515F",
    },

    teamDescription: {
      marginTop: 2,
      marginLeft: 10,
      fontSize: 12,
      color: "#64808C",
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
        "#EAF8F5",
    },

    ruleNumberText: {
      fontSize: 11,

      fontWeight:
        "800",

      color: "#0E7C86",
    },

    ruleText: {
      flex: 1,

      marginLeft: 9,

      paddingTop: 2,

      lineHeight: 20,

      color: "#4D6C78",
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
        "#0E7C86",
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

      color: "#0E2A47",
    },

    errorPageText: {
      marginTop: 8,

      textAlign:
        "center",

      lineHeight: 20,

      color: "#64808C",
    },

    backButtonLarge: {
      marginTop: 20,

      paddingHorizontal:
        25,

      paddingVertical:
        13,

      borderRadius: 14,

      backgroundColor:
        "#0E7C86",
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
        "#EDF5F4",
    },

    modalTitle: {
      fontSize: 21,

      fontWeight:
        "800",

      color: "#0E2A47",
    },

    modalSubtitle: {
      marginTop: 3,
      fontSize: 13,
      color: "#64808C",
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
        "#EAF8F5",
    },

    privacyText: {
      flex: 1,

      marginLeft: 8,

      fontSize: 12,

      lineHeight: 18,

      color: "#09646E",
    },

    inputLabel: {
      marginTop: 20,

      marginBottom: 8,

      fontSize: 14,

      fontWeight:
        "700",

      color: "#31515F",
    },

    reasonInput: {
      minHeight: 140,

      padding: 14,

      borderWidth: 1,

      borderColor:
        "#C4D8DA",

      borderRadius: 15,

      fontSize: 15,

      lineHeight: 21,

      color: "#0E2A47",

      backgroundColor:
        "#ffffff",
    },

    characterCount: {
      marginTop: 5,

      textAlign:
        "right",

      fontSize: 11,

      color: "#8BA3AB",
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
        "#0E7C86",
    },

    submitButtonText: {
      marginLeft: 8,

      fontWeight:
        "800",

      color: "#ffffff",
    },
  });