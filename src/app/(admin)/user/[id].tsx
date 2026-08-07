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
      "Peer-support privileges",
  },
  {
    value: "MODERATOR",
    label: "Moderator",
    description:
      "Community moderation privileges",
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
      "Temporarily prevent account access",
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
        setError(null);
        setLoading(true);

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
        "Action not allowed",
        "You cannot change your own administrator role."
      );

      return;
    }

    Alert.alert(
      "Change user role",
      `Change ${user.fullName}'s role to ${role}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Change Role",

          onPress: () => {
            void updateRole(
              role
            );
          },
        },
      ]
    );
  };

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
          "Role updated",
          "The user's role was updated successfully."
        );
      } catch (requestError) {
        Alert.alert(
          "Unable to update role",
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
        "Action not allowed",
        "You cannot change your own account status."
      );

      return;
    }

    Alert.alert(
      "Change account status",
      `Change ${user.fullName}'s status to ${status}?`,
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
          "Status updated",
          "The account status was updated successfully."
        );
      } catch (requestError) {
        Alert.alert(
          "Unable to update status",
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
        "Revoke active sessions",
        `This will sign ${user.fullName} out from every active device. Continue?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },

          {
            text: "Revoke Sessions",
            style: "destructive",

            onPress: () => {
              void revokeSessions();
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
          "Sessions revoked",
          `${response.data.revokedSessionCount} active session(s) were revoked.`
        );
      } catch (requestError) {
        Alert.alert(
          "Unable to revoke sessions",
          getApiErrorMessage(
            requestError
          )
        );
      } finally {
        setWorking(false);
      }
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
            "#f8fafc",
        }}
      >
        <ActivityIndicator
          size="large"
          color="#4f46e5"
        />

        <Text className="mt-4 text-slate-500">
          Loading user...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor:
          "#f8fafc",
      }}
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-10 pt-4"
        showsVerticalScrollIndicator={
          false
        }
      >
        <View className="mb-6 flex-row items-center">
          <Pressable
            onPress={() =>
              router.back()
            }
            className="mr-4 h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white"
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#0f172a"
            />
          </Pressable>

          <View className="flex-1">
            <Text className="text-3xl font-bold text-slate-900">
              User Details
            </Text>

            <Text className="mt-1 text-sm text-slate-500">
              Manage account permissions and access
            </Text>
          </View>
        </View>

        {error && (
          <View className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4">
            <Text className="text-red-700">
              {error}
            </Text>
          </View>
        )}

        {!user ? (
          <View className="items-center rounded-3xl border border-slate-200 bg-white py-12">
            <Ionicons
              name="person-outline"
              size={36}
              color="#94a3b8"
            />

            <Text className="mt-4 font-bold text-slate-900">
              User unavailable
            </Text>
          </View>
        ) : (
          <>
            <View className="rounded-3xl bg-slate-900 p-6">
              <View className="flex-row items-center">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-white/10">
                  <Text className="text-2xl font-bold text-white">
                    {user.fullName
                      ?.charAt(0)
                      .toUpperCase() ||
                      "U"}
                  </Text>
                </View>

                <View className="ml-4 flex-1">
                  <Text className="text-xl font-bold text-white">
                    {
                      user.fullName
                    }
                  </Text>

                  <Text className="mt-1 text-slate-300">
                    {user.email}
                  </Text>
                </View>
              </View>

              <View className="mt-5 flex-row flex-wrap gap-2">
                <View className="rounded-full bg-white/10 px-4 py-2">
                  <Text className="text-xs font-bold text-white">
                    {user.role}
                  </Text>
                </View>

                <View className="rounded-full bg-white/10 px-4 py-2">
                  <Text className="text-xs font-bold text-white">
                    {
                      user.accountStatus
                    }
                  </Text>
                </View>

                {isCurrentAdmin && (
                  <View className="rounded-full bg-indigo-500 px-4 py-2">
                    <Text className="text-xs font-bold text-white">
                      YOUR ACCOUNT
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
              <Text className="text-lg font-bold text-slate-900">
                Account Information
              </Text>

              <View className="mt-5">
                <Text className="text-xs font-semibold uppercase text-slate-400">
                  Email Verification
                </Text>

                <View className="mt-2 flex-row items-center">
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

                  <Text className="ml-2 font-semibold text-slate-700">
                    {user.isEmailVerified
                      ? "Verified"
                      : "Not verified"}
                  </Text>
                </View>
              </View>

              <View className="mt-5">
                <Text className="text-xs font-semibold uppercase text-slate-400">
                  Authentication Methods
                </Text>

                <View className="mt-3 flex-row flex-wrap gap-2">
                  {user.authProviders?.map(
                    (
                      provider
                    ) => (
                      <View
                        key={
                          provider
                        }
                        className="rounded-full bg-indigo-50 px-4 py-2"
                      >
                        <Text className="text-xs font-bold text-indigo-700">
                          {
                            provider
                          }
                        </Text>
                      </View>
                    )
                  )}
                </View>
              </View>

              <View className="mt-5">
                <Text className="text-xs font-semibold uppercase text-slate-400">
                  Created At
                </Text>

                <Text className="mt-2 font-medium text-slate-700">
                  {formatDate(
                    user.createdAt
                  )}
                </Text>
              </View>

              <View className="mt-5">
                <Text className="text-xs font-semibold uppercase text-slate-400">
                  Last Login
                </Text>

                <Text className="mt-2 font-medium text-slate-700">
                  {formatDate(
                    user.lastLoginAt
                  )}
                </Text>
              </View>
            </View>

            <View className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
              <View className="flex-row items-center">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                  <Ionicons
                    name="shield-outline"
                    size={21}
                    color="#4f46e5"
                  />
                </View>

                <View className="ml-3 flex-1">
                  <Text className="text-lg font-bold text-slate-900">
                    User Role
                  </Text>

                  <Text className="mt-1 text-sm text-slate-500">
                    Control platform permissions
                  </Text>
                </View>
              </View>

              {isCurrentAdmin && (
                <View className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-4">
                  <Text className="text-sm leading-5 text-orange-700">
                    You cannot modify your own administrator role.
                  </Text>
                </View>
              )}

              <View className="mt-5 gap-3">
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
                        className={`rounded-2xl border p-4 ${
                          selected
                            ? "border-indigo-600 bg-indigo-50"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <View className="flex-row items-center">
                          <View className="flex-1">
                            <Text
                              className={`font-bold ${
                                selected
                                  ? "text-indigo-700"
                                  : "text-slate-800"
                              }`}
                            >
                              {
                                role.label
                              }
                            </Text>

                            <Text className="mt-1 text-xs leading-5 text-slate-500">
                              {
                                role.description
                              }
                            </Text>
                          </View>

                          {selected && (
                            <Ionicons
                              name="checkmark-circle"
                              size={22}
                              color="#4f46e5"
                            />
                          )}
                        </View>
                      </Pressable>
                    );
                  }
                )}
              </View>
            </View>

            <View className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
              <View className="flex-row items-center">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                  <Ionicons
                    name="pulse-outline"
                    size={21}
                    color="#059669"
                  />
                </View>

                <View className="ml-3 flex-1">
                  <Text className="text-lg font-bold text-slate-900">
                    Account Status
                  </Text>

                  <Text className="mt-1 text-sm text-slate-500">
                    Control account accessibility
                  </Text>
                </View>
              </View>

              {isCurrentAdmin && (
                <View className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-4">
                  <Text className="text-sm leading-5 text-orange-700">
                    You cannot suspend or deactivate your own administrator account.
                  </Text>
                </View>
              )}

              <View className="mt-5 gap-3">
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
                        className={`rounded-2xl border p-4 ${
                          selected
                            ? status.value ===
                              "ACTIVE"
                              ? "border-emerald-500 bg-emerald-50"
                              : status.value ===
                                  "SUSPENDED"
                                ? "border-orange-500 bg-orange-50"
                                : "border-red-500 bg-red-50"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <View className="flex-row items-center">
                          <View className="flex-1">
                            <Text className="font-bold text-slate-800">
                              {
                                status.label
                              }
                            </Text>

                            <Text className="mt-1 text-xs leading-5 text-slate-500">
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

            <View className="mt-6 rounded-3xl border border-red-200 bg-white p-6">
              <View className="flex-row items-center">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                  <Ionicons
                    name="log-out-outline"
                    size={21}
                    color="#dc2626"
                  />
                </View>

                <View className="ml-3 flex-1">
                  <Text className="text-lg font-bold text-slate-900">
                    Session Management
                  </Text>

                  <Text className="mt-1 text-sm text-slate-500">
                    End active login sessions
                  </Text>
                </View>
              </View>

              <Text className="mt-5 text-sm leading-6 text-slate-500">
                Revoking sessions will immediately require the user to sign in again on every device.
              </Text>

              <Pressable
                disabled={
                  working
                }
                onPress={
                  confirmRevokeSessions
                }
                className={`mt-5 min-h-14 flex-row items-center justify-center rounded-2xl ${
                  working
                    ? "bg-red-300"
                    : "bg-red-600"
                }`}
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

                    <Text className="ml-2 font-bold text-white">
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