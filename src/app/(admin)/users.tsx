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
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

import { router } from "expo-router";

import { adminApi } from "@/features/admin/api/admin.api";

import type {
    AdminUser,
} from "@/features/admin/types/admin.types";

import {
    getApiErrorMessage,
} from "@/services/api/apiError";

export default function AdminUsersScreen() {
  const [users, setUsers] =
    useState<AdminUser[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const loadUsers =
    useCallback(async () => {
      try {
        setError(null);

        const response =
          await adminApi.getUsers({
            page: 1,
            limit: 50,

            search:
              search.trim() ||
              undefined,
          });

        setUsers(
          response.data.users
        );
      } catch (requestError) {
        setError(
          getApiErrorMessage(
            requestError
          )
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, [search]);

  useEffect(() => {
    const timeout =
      setTimeout(() => {
        void loadUsers();
      }, 400);

    return () =>
      clearTimeout(timeout);
  }, [loadUsers]);

  const handleRefresh = () => {
    setRefreshing(true);

    void loadUsers();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <View className="px-6 pb-4 pt-8">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-slate-900">
              Users
            </Text>

            <Text className="mt-1 text-slate-500">
              Manage platform accounts
            </Text>
          </View>

          <Pressable
            onPress={() =>
              router.back()
            }
            className="rounded-xl bg-slate-200 px-4 py-2"
          >
            <Text className="font-semibold text-slate-700">
              Back
            </Text>
          </Pressable>
        </View>

        <TextInput
          className="mt-6 min-h-14 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900"
          placeholder="Search name or email..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pb-10"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={
                handleRefresh
              }
            />
          }
        >
          {error && (
            <View className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4">
              <Text className="text-red-700">
                {error}
              </Text>
            </View>
          )}

          {users.length === 0 ? (
            <View className="mt-10 items-center">
              <Text className="text-lg font-semibold text-slate-700">
                No users found
              </Text>
            </View>
          ) : (
            users.map((user) => (
              <Pressable
                key={user.id}
                onPress={() =>
                  router.push({
                    pathname:
                      "/(admin)/user/[id]",

                    params: {
                      id: user.id,
                    },
                  })
                }
                className="mb-3 rounded-3xl border border-slate-200 bg-white p-5"
              >
                <View className="flex-row items-center">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                    <Text className="text-lg font-bold text-indigo-700">
                      {user.fullName
                        .charAt(0)
                        .toUpperCase()}
                    </Text>
                  </View>

                  <View className="ml-4 flex-1">
                    <Text className="text-base font-bold text-slate-900">
                      {user.fullName}
                    </Text>

                    <Text className="mt-1 text-sm text-slate-500">
                      {user.email}
                    </Text>
                  </View>

                  <View>
                    <Text className="text-right text-xs font-bold text-indigo-600">
                      {user.role}
                    </Text>

                    <Text
                      className={`mt-1 text-right text-xs font-semibold ${
                        user.accountStatus ===
                        "ACTIVE"
                          ? "text-emerald-600"
                          : "text-red-500"
                      }`}
                    >
                      {
                        user.accountStatus
                      }
                    </Text>
                  </View>
                </View>

                <View className="mt-4 flex-row gap-2">
                  {user.authProviders.map(
                    (provider) => (
                      <View
                        key={provider}
                        className="rounded-full bg-slate-100 px-3 py-1"
                      >
                        <Text className="text-xs font-semibold text-slate-600">
                          {provider}
                        </Text>
                      </View>
                    )
                  )}
                </View>
              </Pressable>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}