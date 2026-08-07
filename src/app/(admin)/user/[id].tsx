import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    SafeAreaView,
} from "react-native-safe-area-context";

import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";

import {
    router,
    useLocalSearchParams,
} from "expo-router";

import { adminApi } from "@/features/admin/api/admin.api";

import type {
    AdminUser,
} from "@/features/admin/types/admin.types";

import type {
    AccountStatus,
    UserRole,
} from "@/features/auth/types/auth.types";

import {
    getApiErrorMessage,
} from "@/services/api/apiError";

const roles: UserRole[] = [
  "USER",
  "PEER_SUPPORTER",
  "MODERATOR",
  "ADMIN",
];

const statuses: AccountStatus[] = [
  "ACTIVE",
  "SUSPENDED",
  "DEACTIVATED",
];

export default function AdminUserDetailsScreen() {
  const params =
    useLocalSearchParams<{
      id?: string;
    }>();

  const userId =
    typeof params.id === "string"
      ? params.id
      : "";

  const [user, setUser] =
    useState<AdminUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [working, setWorking] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const loadUser =
    useCallback(async () => {
      if (!userId) {
        return;
      }

      try {
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

  const updateRole = async (
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

  const updateStatus = async (
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

  const revokeSessions = () => {
    if (!user) {
      return;
    }

    Alert.alert(
      "Revoke sessions",
      `Log ${user.fullName} out from all active devices?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Revoke",
          style: "destructive",

          onPress: async () => {
            try {
              setWorking(true);

              const response =
                await adminApi.revokeSessions(
                  user.id
                );

              Alert.alert(
                "Sessions revoked",
                `${response.data.revokedSessionCount} session(s) revoked.`
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
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc" }}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <ScrollView
        contentContainerClassName="px-6 pb-10 pt-8"
      >
        <Pressable
          onPress={() =>
            router.back()
          }
          className="mb-6 self-start rounded-xl bg-slate-200 px-4 py-2"
        >
          <Text className="font-semibold text-slate-700">
            Back
          </Text>
        </Pressable>

        {error && (
          <View className="rounded-2xl bg-red-50 p-4">
            <Text className="text-red-700">
              {error}
            </Text>
          </View>
        )}

        {user && (
          <>
            <View className="rounded-3xl bg-slate-900 p-6">
              <Text className="text-2xl font-bold text-white">
                {user.fullName}
              </Text>

              <Text className="mt-2 text-slate-300">
                {user.email}
              </Text>

              <Text className="mt-4 text-sm text-slate-400">
                Providers:{" "}
                {user.authProviders.join(
                  ", "
                )}
              </Text>
            </View>

            <View className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
              <Text className="text-xl font-bold text-slate-900">
                Role
              </Text>

              <View className="mt-4 gap-2">
                {roles.map(
                  (role) => (
                    <Pressable
                      key={role}
                      disabled={working}
                      onPress={() =>
                        updateRole(role)
                      }
                      className={`min-h-12 justify-center rounded-xl border px-4 ${
                        user.role ===
                        role
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-slate-200"
                      }`}
                    >
                      <Text
                        className={`font-semibold ${
                          user.role ===
                          role
                            ? "text-indigo-700"
                            : "text-slate-700"
                        }`}
                      >
                        {role}
                      </Text>
                    </Pressable>
                  )
                )}
              </View>
            </View>

            <View className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
              <Text className="text-xl font-bold text-slate-900">
                Account Status
              </Text>

              <View className="mt-4 gap-2">
                {statuses.map(
                  (status) => (
                    <Pressable
                      key={status}
                      disabled={working}
                      onPress={() =>
                        updateStatus(
                          status
                        )
                      }
                      className={`min-h-12 justify-center rounded-xl border px-4 ${
                        user.accountStatus ===
                        status
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-slate-200"
                      }`}
                    >
                      <Text className="font-semibold text-slate-700">
                        {status}
                      </Text>
                    </Pressable>
                  )
                )}
              </View>
            </View>

            <Pressable
              disabled={working}
              onPress={
                revokeSessions
              }
              className="mt-6 min-h-14 items-center justify-center rounded-2xl border border-red-200 bg-red-50"
            >
              <Text className="font-bold text-red-700">
                Revoke All User Sessions
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}