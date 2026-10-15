import { useThemeTone, useThemedClassName } from '@/theme/useAlyvenAppearance';
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  adminApi,
} from "@/features/admin/api/admin.api";

import type {
  AdminUser,
} from "@/features/admin/types/admin.types";

import type {
  AccountStatus,
  UserRole,
} from "@/features/auth/types/auth.types";

import {
  useAuth,
} from "@/features/auth/hooks/useAuth";

import {
  getApiErrorMessage,
} from "@/services/api/apiError";

const ROLES: Array<{
  value: UserRole;
  label: string;
  description: string;
}> = [
  {
    value: "USER",
    label: "User",
    description:
      "Standard platform access",
  },

  {
    value: "PEER_SUPPORTER",
    label: "Peer Supporter",
    description:
      "Peer support privileges",
  },

  {
    value: "MODERATOR",
    label: "Moderator",
    description:
      "Community moderation access",
  },

  {
    value: "ADMIN",
    label: "Administrator",
    description:
      "Full administrative access",
  },
];

const STATUSES: Array<{
  value: AccountStatus;
  label: string;
  description: string;
}> = [
  {
    value: "ACTIVE",
    label: "Active",
    description:
      "User can access the platform",
  },

  {
    value: "SUSPENDED",
    label: "Suspended",
    description:
      "Temporarily block account access",
  },

  {
    value: "DEACTIVATED",
    label: "Deactivated",
    description:
      "Disable this account",
  },
];

const formatDate = (
  value?: string | null
) => {
  if (!value) {
    return "Not available";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Not available";
  }

  return date.toLocaleString();
};

export default function AdminUserDetailsScreen() {
  const themeClass = useThemedClassName();
  const themeTone = useThemeTone();

  const {
    user: currentAdmin,
  } = useAuth();

  const params =
    useLocalSearchParams<{
      id?: string;
    }>();

  const userId =
    typeof params.id ===
    "string"
      ? params.id
      : "";

  const [
    user,
    setUser,
  ] =
    useState<AdminUser | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    working,
    setWorking,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const isCurrentAdmin =
    Boolean(
      user &&
        currentAdmin &&
        user.id ===
          currentAdmin.id
    );

  const loadUser =
    useCallback(async () => {
      if (!userId) {
        setError(
          "User ID is missing."
        );

        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response =
          await adminApi.getUser(
            userId
          );

        setUser(
          response.data.user
        );
      } catch (requestError) {
        setError(
          getApiErrorMessage(
            requestError
          )
        );
      } finally {
        setLoading(false);
      }
    }, [userId]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const updateRole =
    async (
      role: UserRole
    ) => {
      if (!user) {
        return;
      }

      try {
        setWorking(true);

        const response =
          await adminApi.updateRole(
            user.id,
            role
          );

        setUser(
          response.data.user
        );

        Alert.alert(
          "Role Updated",
          "The user role was updated successfully."
        );
      } catch (requestError) {
        Alert.alert(
          "Unable to Update Role",
          getApiErrorMessage(
            requestError
          )
        );
      } finally {
        setWorking(false);
      }
    };

  const confirmRoleChange = (
    role: UserRole
  ) => {
    if (!user) {
      return;
    }

    if (
      user.role === role
    ) {
      return;
    }

    if (isCurrentAdmin) {
      Alert.alert(
        "Action Not Allowed",
        "You cannot change your own administrator role."
      );

      return;
    }

    Alert.alert(
      "Change Role",
      `Change ${user.fullName}'s role to ${role}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Change",

          onPress: () => {
            void updateRole(
              role
            );
          },
        },
      ]
    );
  };

  const updateStatus =
    async (
      status: AccountStatus
    ) => {
      if (!user) {
        return;
      }

      try {
        setWorking(true);

        const response =
          await adminApi.updateStatus(
            user.id,
            status
          );

        setUser(
          response.data.user
        );

        Alert.alert(
          "Status Updated",
          "The account status was updated successfully."
        );
      } catch (requestError) {
        Alert.alert(
          "Unable to Update Status",
          getApiErrorMessage(
            requestError
          )
        );
      } finally {
        setWorking(false);
      }
    };

  const confirmStatusChange = (
    status: AccountStatus
  ) => {
    if (!user) {
      return;
    }

    if (
      user.accountStatus ===
      status
    ) {
      return;
    }

    if (isCurrentAdmin) {
      Alert.alert(
        "Action Not Allowed",
        "You cannot suspend or deactivate your own administrator account."
      );

      return;
    }

    Alert.alert(
      "Change Account Status",
      `Change ${user.fullName}'s account status to ${status}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Continue",

          style:
            status === "ACTIVE"
              ? "default"
              : "destructive",

          onPress: () => {
            void updateStatus(
              status
            );
          },
        },
      ]
    );
  };

  const revokeSessions =
    async () => {
      if (!user) {
        return;
      }

      try {
        setWorking(true);

        const response =
          await adminApi.revokeSessions(
            user.id
          );

        Alert.alert(
          "Sessions Revoked",
          `${response.data.revokedSessionCount} active session(s) were revoked.`
        );
      } catch (requestError) {
        Alert.alert(
          "Unable to Revoke Sessions",
          getApiErrorMessage(
            requestError
          )
        );
      } finally {
        setWorking(false);
      }
    };

  const confirmRevokeSessions =
    () => {
      if (!user) {
        return;
      }

      Alert.alert(
        "Revoke Sessions",
        `Sign ${user.fullName} out from all active devices?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },

          {
            text: "Revoke",
            style: "destructive",

            onPress: () => {
              void revokeSessions();
            },
          },
        ]
      );
    };

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems:
            "center",
          justifyContent:
            "center",
          backgroundColor:
            themeTone("#F5FAF9", "backgroundColor"),
        }}
      >
        <ActivityIndicator
          size="large"
          color={themeTone("#0E7C86", "color")}
        />

        <Text className={themeClass("mt-4 text-slate-500")}>
          Loading user...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: themeTone("#F5FAF9", "backgroundColor"),
      }}
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
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={
          false
        }
      >
        <View className={themeClass("mb-6 flex-row items-center")}>
          <Pressable
            onPress={() =>
              router.back()
            }
            className={themeClass("mr-4 h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white")}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={themeTone("#0E2A47", "color")}
            />
          </Pressable>

          <View className={themeClass("flex-1")}>
            <Text className={themeClass("text-3xl font-bold text-slate-900")}>
              User Details
            </Text>

            <Text className={themeClass("mt-1 text-sm text-slate-500")}>
              Manage permissions and access
            </Text>
          </View>
        </View>

        {error && (
          <View className={themeClass("mb-5 rounded-2xl border border-red-200 bg-red-50 p-4")}>
            <Text className={themeClass("text-red-700")}>
              {error}
            </Text>
          </View>
        )}

        {!user ? (
          <View className={themeClass("items-center rounded-3xl border border-slate-200 bg-white py-12")}>
            <Ionicons
              name="person-outline"
              size={36}
              color={themeTone("#8BA3AB", "color")}
            />

            <Text className={themeClass("mt-4 font-bold text-slate-900")}>
              User not available
            </Text>
          </View>
        ) : (
          <>
            <View className={themeClass("rounded-3xl bg-slate-900 p-6")}>
              <View className={themeClass("flex-row items-center")}>
                <View className={themeClass("h-16 w-16 items-center justify-center rounded-full bg-white/10")}>
                  <Text className={themeClass("text-2xl font-bold text-white")}>
                    {user.fullName
                      ?.charAt(0)
                      .toUpperCase() ||
                      "U"}
                  </Text>
                </View>

                <View className={themeClass("ml-4 flex-1")}>
                  <Text className={themeClass("text-xl font-bold text-white")}>
                    {
                      user.fullName
                    }
                  </Text>

                  <Text className={themeClass("mt-1 text-slate-300")}>
                    {user.email}
                  </Text>
                </View>
              </View>

              <View className={themeClass("mt-5 flex-row flex-wrap gap-2")}>
                <View className={themeClass("rounded-full bg-white/10 px-4 py-2")}>
                  <Text className={themeClass("text-xs font-bold text-white")}>
                    {user.role}
                  </Text>
                </View>

                <View className={themeClass("rounded-full bg-white/10 px-4 py-2")}>
                  <Text className={themeClass("text-xs font-bold text-white")}>
                    {
                      user.accountStatus
                    }
                  </Text>
                </View>

                {isCurrentAdmin && (
                  <View className={themeClass("rounded-full bg-indigo-500 px-4 py-2")}>
                    <Text className={themeClass("text-xs font-bold text-white")}>
                      YOUR ACCOUNT
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View className={themeClass("mt-6 rounded-3xl border border-slate-200 bg-white p-6")}>
              <Text className={themeClass("text-lg font-bold text-slate-900")}>
                Account Information
              </Text>

              <View className={themeClass("mt-5")}>
                <Text className={themeClass("text-xs font-semibold uppercase text-slate-400")}>
                  Email
                </Text>

                <Text className={themeClass("mt-2 font-semibold text-slate-700")}>
                  {user.email}
                </Text>
              </View>

              <View className={themeClass("mt-5")}>
                <Text className={themeClass("text-xs font-semibold uppercase text-slate-400")}>
                  Email Verification
                </Text>

                <View className={themeClass("mt-2 flex-row items-center")}>
                  <Ionicons
                    name={
                      user.isEmailVerified
                        ? "checkmark-circle"
                        : "close-circle"
                    }
                    size={20}
                    color={
                      user.isEmailVerified
                        ? "#059669"
                        : "#dc2626"
                    }
                  />

                  <Text className={themeClass("ml-2 font-semibold text-slate-700")}>
                    {user.isEmailVerified
                      ? "Verified"
                      : "Not Verified"}
                  </Text>
                </View>
              </View>

              <View className={themeClass("mt-5")}>
                <Text className={themeClass("text-xs font-semibold uppercase text-slate-400")}>
                  Login Methods
                </Text>

                <View className={themeClass("mt-3 flex-row flex-wrap gap-2")}>
                  {user.authProviders?.map(
                    (
                      provider
                    ) => (
                      <View
                        key={
                          provider
                        }
                        className={themeClass("rounded-full bg-indigo-50 px-4 py-2")}
                      >
                        <Text className={themeClass("text-xs font-bold text-indigo-700")}>
                          {
                            provider
                          }
                        </Text>
                      </View>
                    )
                  )}
                </View>
              </View>

              <View className={themeClass("mt-5")}>
                <Text className={themeClass("text-xs font-semibold uppercase text-slate-400")}>
                  Created
                </Text>

                <Text className={themeClass("mt-2 font-medium text-slate-700")}>
                  {formatDate(
                    user.createdAt
                  )}
                </Text>
              </View>

              <View className={themeClass("mt-5")}>
                <Text className={themeClass("text-xs font-semibold uppercase text-slate-400")}>
                  Last Login
                </Text>

                <Text className={themeClass("mt-2 font-medium text-slate-700")}>
                  {formatDate(
                    user.lastLoginAt
                  )}
                </Text>
              </View>
            </View>

            <View className={themeClass("mt-6 rounded-3xl border border-slate-200 bg-white p-6")}>
              <View className={themeClass("flex-row items-center")}>
                <View className={themeClass("h-10 w-10 items-center justify-center rounded-xl bg-indigo-50")}>
                  <Ionicons
                    name="shield-outline"
                    size={21}
                    color={themeTone("#0E7C86", "color")}
                  />
                </View>

                <View className={themeClass("ml-3 flex-1")}>
                  <Text className={themeClass("text-lg font-bold text-slate-900")}>
                    User Role
                  </Text>

                  <Text className={themeClass("mt-1 text-sm text-slate-500")}>
                    Manage platform permissions
                  </Text>
                </View>
              </View>

              {isCurrentAdmin && (
                <View className={themeClass("mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-4")}>
                  <Text className={themeClass("text-sm leading-5 text-orange-700")}>
                    You cannot modify your own
                    administrator role.
                  </Text>
                </View>
              )}

              <View className={themeClass("mt-5 gap-3")}>
                {ROLES.map(
                  (role) => {
                    const selected =
                      user.role ===
                      role.value;

                    return (
                      <Pressable
                        key={
                          role.value
                        }
                        disabled={
                          working ||
                          isCurrentAdmin
                        }
                        onPress={() =>
                          confirmRoleChange(
                            role.value
                          )
                        }
                        className={themeClass(`rounded-2xl border p-4 ${
                          selected
                            ? "border-indigo-600 bg-indigo-50"
                            : "border-slate-200 bg-white"
                        }`)}
                      >
                        <View className={themeClass("flex-row items-center")}>
                          <View className={themeClass("flex-1")}>
                            <Text
                              className={themeClass(`font-bold ${
                                selected
                                  ? "text-indigo-700"
                                  : "text-slate-800"
                              }`)}
                            >
                              {
                                role.label
                              }
                            </Text>

                            <Text className={themeClass("mt-1 text-xs leading-5 text-slate-500")}>
                              {
                                role.description
                              }
                            </Text>
                          </View>

                          {selected && (
                            <Ionicons
                              name="checkmark-circle"
                              size={22}
                              color={themeTone("#0E7C86", "color")}
                            />
                          )}
                        </View>
                      </Pressable>
                    );
                  }
                )}
              </View>
            </View>

            <View className={themeClass("mt-6 rounded-3xl border border-slate-200 bg-white p-6")}>
              <View className={themeClass("flex-row items-center")}>
                <View className={themeClass("h-10 w-10 items-center justify-center rounded-xl bg-emerald-50")}>
                  <Ionicons
                    name="pulse-outline"
                    size={21}
                    color={themeTone("#059669", "color")}
                  />
                </View>

                <View className={themeClass("ml-3 flex-1")}>
                  <Text className={themeClass("text-lg font-bold text-slate-900")}>
                    Account Status
                  </Text>

                  <Text className={themeClass("mt-1 text-sm text-slate-500")}>
                    Control account access
                  </Text>
                </View>
              </View>

              {isCurrentAdmin && (
                <View className={themeClass("mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-4")}>
                  <Text className={themeClass("text-sm leading-5 text-orange-700")}>
                    You cannot change your own
                    administrator account status.
                  </Text>
                </View>
              )}

              <View className={themeClass("mt-5 gap-3")}>
                {STATUSES.map(
                  (status) => {
                    const selected =
                      user.accountStatus ===
                      status.value;

                    return (
                      <Pressable
                        key={
                          status.value
                        }
                        disabled={
                          working ||
                          isCurrentAdmin
                        }
                        onPress={() =>
                          confirmStatusChange(
                            status.value
                          )
                        }
                        className={themeClass(`rounded-2xl border p-4 ${
                          selected
                            ? status.value ===
                              "ACTIVE"
                              ? "border-emerald-500 bg-emerald-50"
                              : status.value ===
                                  "SUSPENDED"
                                ? "border-orange-500 bg-orange-50"
                                : "border-red-500 bg-red-50"
                            : "border-slate-200 bg-white"
                        }`)}
                      >
                        <View className={themeClass("flex-row items-center")}>
                          <View className={themeClass("flex-1")}>
                            <Text className={themeClass("font-bold text-slate-800")}>
                              {
                                status.label
                              }
                            </Text>

                            <Text className={themeClass("mt-1 text-xs leading-5 text-slate-500")}>
                              {
                                status.description
                              }
                            </Text>
                          </View>

                          {selected && (
                            <Ionicons
                              name="checkmark-circle"
                              size={22}
                              color={
                                status.value ===
                                "ACTIVE"
                                  ? "#059669"
                                  : status.value ===
                                      "SUSPENDED"
                                    ? "#ea580c"
                                    : "#dc2626"
                              }
                            />
                          )}
                        </View>
                      </Pressable>
                    );
                  }
                )}
              </View>
            </View>

            <View className={themeClass("mt-6 rounded-3xl border border-red-200 bg-white p-6")}>
              <View className={themeClass("flex-row items-center")}>
                <View className={themeClass("h-10 w-10 items-center justify-center rounded-xl bg-red-50")}>
                  <Ionicons
                    name="log-out-outline"
                    size={21}
                    color={themeTone("#dc2626", "color")}
                  />
                </View>

                <View className={themeClass("ml-3 flex-1")}>
                  <Text className={themeClass("text-lg font-bold text-slate-900")}>
                    Session Management
                  </Text>

                  <Text className={themeClass("mt-1 text-sm text-slate-500")}>
                    End active sessions
                  </Text>
                </View>
              </View>

              <Text className={themeClass("mt-5 text-sm leading-6 text-slate-500")}>
                Revoking sessions signs this user
                out from every active device.
              </Text>

              <Pressable
                disabled={
                  working
                }
                onPress={
                  confirmRevokeSessions
                }
                className={themeClass(`mt-5 min-h-14 flex-row items-center justify-center rounded-2xl ${
                  working
                    ? "bg-red-300"
                    : "bg-red-600"
                }`)}
              >
                {working ? (
                  <ActivityIndicator
                    color="white"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="log-out-outline"
                      size={20}
                      color="white"
                    />

                    <Text className={themeClass("ml-2 font-bold text-white")}>
                      Revoke All Sessions
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}