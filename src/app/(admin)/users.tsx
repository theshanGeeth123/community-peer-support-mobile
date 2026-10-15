import { useThemeTone, useThemedClassName } from '@/theme/useAlyvenAppearance';
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  router,
} from "expo-router";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  adminApi,
} from "@/features/admin/api/admin.api";

import type {
  AdminUser,
  UserPagination,
} from "@/features/admin/types/admin.types";

import type {
  AccountStatus,
  UserRole,
} from "@/features/auth/types/auth.types";

import {
  getApiErrorMessage,
} from "@/services/api/apiError";

const PAGE_SIZE = 10;

const ROLE_FILTERS: Array<{
  label: string;
  value?: UserRole;
}> = [
  {
    label: "All",
  },
  {
    label: "Users",
    value: "USER",
  },
  {
    label: "Peer Supporters",
    value: "PEER_SUPPORTER",
  },
  {
    label: "Moderators",
    value: "MODERATOR",
  },
  {
    label: "Admins",
    value: "ADMIN",
  },
];

const STATUS_FILTERS: Array<{
  label: string;
  value?: AccountStatus;
}> = [
  {
    label: "All",
  },
  {
    label: "Active",
    value: "ACTIVE",
  },
  {
    label: "Suspended",
    value: "SUSPENDED",
  },
  {
    label: "Deactivated",
    value: "DEACTIVATED",
  },
];

export default function AdminUsersScreen() {
  const themeClass = useThemedClassName();
  const themeTone = useThemeTone();

  const [
    users,
    setUsers,
  ] = useState<AdminUser[]>([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState("");

  const [
    selectedRole,
    setSelectedRole,
  ] = useState<UserRole | undefined>(
    undefined
  );

  const [
    selectedStatus,
    setSelectedStatus,
  ] =
    useState<AccountStatus | undefined>(
      undefined
    );

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    pagination,
    setPagination,
  ] = useState<UserPagination>({
    page: 1,
    limit: PAGE_SIZE,
    totalUsers: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  useEffect(() => {
    const timer = setTimeout(
      () => {
        setDebouncedSearch(
          search.trim()
        );

        setCurrentPage(1);
      },
      400
    );

    return () =>
      clearTimeout(timer);
  }, [search]);

  const loadUsers =
    useCallback(async () => {
      try {
        setError(null);

        const response =
          await adminApi.getUsers({
            page: currentPage,
            limit: PAGE_SIZE,

            search:
              debouncedSearch ||
              undefined,

            role:
              selectedRole,

            status:
              selectedStatus,
          });

        const responseUsers =
          Array.isArray(
            response.data.users
          )
            ? response.data.users
            : [];

        setUsers(responseUsers);

        setPagination({
          page:
            response.data.pagination
              ?.page ??
            currentPage,

          limit:
            response.data.pagination
              ?.limit ??
            PAGE_SIZE,

          totalUsers:
            response.data.pagination
              ?.totalUsers ??
            responseUsers.length,

          totalPages:
            Math.max(
              response.data.pagination
                ?.totalPages ?? 1,
              1
            ),

          hasNextPage:
            response.data.pagination
              ?.hasNextPage ??
            false,

          hasPreviousPage:
            response.data.pagination
              ?.hasPreviousPage ??
            false,
        });
      } catch (requestError) {
        setUsers([]);

        setError(
          getApiErrorMessage(
            requestError
          )
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, [
      currentPage,
      debouncedSearch,
      selectedRole,
      selectedStatus,
    ]);

  useEffect(() => {
    setLoading(true);

    void loadUsers();
  }, [loadUsers]);

  const handleRefresh = () => {
    setRefreshing(true);

    void loadUsers();
  };

  const handleRoleFilter = (
    role?: UserRole
  ) => {
    setSelectedRole(role);
    setCurrentPage(1);
  };

  const handleStatusFilter = (
    status?: AccountStatus
  ) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");

    setSelectedRole(undefined);
    setSelectedStatus(undefined);

    setCurrentPage(1);
  };

  const hasFilters =
    search.length > 0 ||
    Boolean(selectedRole) ||
    Boolean(selectedStatus);

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
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={
              handleRefresh
            }
          />
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
              User Management
            </Text>

            <Text className={themeClass("mt-1 text-sm text-slate-500")}>
              Manage users, roles and access
            </Text>
          </View>
        </View>

        <View className={themeClass("rounded-3xl bg-slate-900 p-6")}>
          <View className={themeClass("flex-row items-center")}>
            <View className={themeClass("h-12 w-12 items-center justify-center rounded-2xl bg-white/10")}>
              <Ionicons
                name="shield-checkmark"
                size={24}
                color="white"
              />
            </View>

            <View className={themeClass("ml-4 flex-1")}>
              <Text className={themeClass("text-lg font-bold text-white")}>
                Admin Control Center
              </Text>

              <Text className={themeClass("mt-1 text-sm leading-5 text-slate-300")}>
                Review registered users and
                manage platform permissions.
              </Text>
            </View>
          </View>
        </View>

        <View className={themeClass("mt-5 flex-row gap-3")}>
          <View className={themeClass("flex-1 rounded-3xl border border-slate-200 bg-white p-5")}>
            <View className={themeClass("h-10 w-10 items-center justify-center rounded-xl bg-indigo-50")}>
              <Ionicons
                name="people-outline"
                size={21}
                color={themeTone("#0E7C86", "color")}
              />
            </View>

            <Text className={themeClass("mt-4 text-3xl font-bold text-slate-900")}>
              {
                pagination.totalUsers
              }
            </Text>

            <Text className={themeClass("mt-1 text-sm text-slate-500")}>
              Registered Users
            </Text>
          </View>

          <View className={themeClass("flex-1 rounded-3xl border border-slate-200 bg-white p-5")}>
            <View className={themeClass("h-10 w-10 items-center justify-center rounded-xl bg-emerald-50")}>
              <Ionicons
                name="document-text-outline"
                size={21}
                color={themeTone("#059669", "color")}
              />
            </View>

            <Text className={themeClass("mt-4 text-3xl font-bold text-slate-900")}>
              {
                pagination.totalPages
              }
            </Text>

            <Text className={themeClass("mt-1 text-sm text-slate-500")}>
              Total Pages
            </Text>
          </View>
        </View>

        <Text className={themeClass("mb-3 mt-7 text-lg font-bold text-slate-900")}>
          Search Users
        </Text>

        <View className={themeClass("min-h-14 flex-row items-center rounded-2xl border border-slate-200 bg-white px-4")}>
          <Ionicons
            name="search-outline"
            size={21}
            color={themeTone("#8BA3AB", "color")}
          />

          <TextInput
            className={themeClass("ml-3 flex-1 text-base text-slate-900")}
            placeholder="Search name or email..."
            placeholderTextColor={themeTone("#8BA3AB", "placeholderTextColor")}
            value={search}
            onChangeText={
              setSearch
            }
            autoCapitalize="none"
            autoCorrect={false}
          />

          {search.length > 0 && (
            <Pressable
              onPress={() =>
                setSearch("")
              }
            >
              <Ionicons
                name="close-circle"
                size={21}
                color={themeTone("#8BA3AB", "color")}
              />
            </Pressable>
          )}
        </View>

        <Text className={themeClass("mb-3 mt-6 font-bold text-slate-900")}>
          Role
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
        >
          {ROLE_FILTERS.map(
            (item) => {
              const selected =
                selectedRole ===
                item.value;

              return (
                <Pressable
                  key={
                    item.label
                  }
                  onPress={() =>
                    handleRoleFilter(
                      item.value
                    )
                  }
                  className={themeClass(`mr-2 rounded-full border px-4 py-2.5 ${
                    selected
                      ? "border-indigo-600 bg-indigo-600"
                      : "border-slate-200 bg-white"
                  }`)}
                >
                  <Text
                    className={themeClass(`text-sm font-semibold ${
                      selected
                        ? "text-white"
                        : "text-slate-600"
                    }`)}
                  >
                    {
                      item.label
                    }
                  </Text>
                </Pressable>
              );
            }
          )}
        </ScrollView>

        <Text className={themeClass("mb-3 mt-5 font-bold text-slate-900")}>
          Status
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
        >
          {STATUS_FILTERS.map(
            (item) => {
              const selected =
                selectedStatus ===
                item.value;

              return (
                <Pressable
                  key={
                    item.label
                  }
                  onPress={() =>
                    handleStatusFilter(
                      item.value
                    )
                  }
                  className={themeClass(`mr-2 rounded-full border px-4 py-2.5 ${
                    selected
                      ? "border-indigo-600 bg-indigo-600"
                      : "border-slate-200 bg-white"
                  }`)}
                >
                  <Text
                    className={themeClass(`text-sm font-semibold ${
                      selected
                        ? "text-white"
                        : "text-slate-600"
                    }`)}
                  >
                    {
                      item.label
                    }
                  </Text>
                </Pressable>
              );
            }
          )}
        </ScrollView>

        {hasFilters && (
          <Pressable
            onPress={
              clearFilters
            }
            className={themeClass("mt-4 self-start")}
          >
            <Text className={themeClass("font-semibold text-indigo-600")}>
              Clear Filters
            </Text>
          </Pressable>
        )}

        <View className={themeClass("mb-4 mt-8 flex-row items-center justify-between")}>
          <Text className={themeClass("text-lg font-bold text-slate-900")}>
            Users
          </Text>

          <Text className={themeClass("text-sm text-slate-500")}>
            {users.length} shown
          </Text>
        </View>

        {error && (
          <View className={themeClass("mb-4 rounded-2xl border border-red-200 bg-red-50 p-4")}>
            <View className={themeClass("flex-row items-start")}>
              <Ionicons
                name="alert-circle-outline"
                size={22}
                color={themeTone("#dc2626", "color")}
              />

              <Text className={themeClass("ml-3 flex-1 leading-5 text-red-700")}>
                {error}
              </Text>
            </View>
          </View>
        )}

        {loading ? (
          <View className={themeClass("items-center py-16")}>
            <ActivityIndicator
              size="large"
              color={themeTone("#0E7C86", "color")}
            />

            <Text className={themeClass("mt-4 text-slate-500")}>
              Loading users...
            </Text>
          </View>
        ) : users.length === 0 ? (
          <View className={themeClass("items-center rounded-3xl border border-slate-200 bg-white px-6 py-12")}>
            <View className={themeClass("h-16 w-16 items-center justify-center rounded-full bg-slate-100")}>
              <Ionicons
                name="people-outline"
                size={30}
                color={themeTone("#64808C", "color")}
              />
            </View>

            <Text className={themeClass("mt-5 text-lg font-bold text-slate-900")}>
              No users found
            </Text>

            <Text className={themeClass("mt-2 text-center leading-5 text-slate-500")}>
              Try changing the search or filter
              options.
            </Text>
          </View>
        ) : (
          users.map(
            (user) => (
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
                className={themeClass("mb-3 rounded-3xl border border-slate-200 bg-white p-5")}
              >
                <View className={themeClass("flex-row items-center")}>
                  <View className={themeClass("h-12 w-12 items-center justify-center rounded-full bg-indigo-100")}>
                    <Text className={themeClass("text-lg font-bold text-indigo-700")}>
                      {user.fullName
                        ?.charAt(0)
                        .toUpperCase() ||
                        "U"}
                    </Text>
                  </View>

                  <View className={themeClass("ml-4 flex-1")}>
                    <Text
                      numberOfLines={1}
                      className={themeClass("text-base font-bold text-slate-900")}
                    >
                      {
                        user.fullName
                      }
                    </Text>

                    <Text
                      numberOfLines={1}
                      className={themeClass("mt-1 text-sm text-slate-500")}
                    >
                      {user.email}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={themeTone("#8BA3AB", "color")}
                  />
                </View>

                <View className={themeClass("mt-4 flex-row flex-wrap gap-2")}>
                  <View className={themeClass("rounded-full bg-indigo-50 px-3 py-1.5")}>
                    <Text className={themeClass("text-xs font-bold text-indigo-700")}>
                      {user.role}
                    </Text>
                  </View>

                  <View
                    className={themeClass(user.accountStatus ===
                      "ACTIVE"
                        ? "rounded-full bg-emerald-50 px-3 py-1.5"
                        : user.accountStatus ===
                            "SUSPENDED"
                          ? "rounded-full bg-orange-50 px-3 py-1.5"
                          : "rounded-full bg-red-50 px-3 py-1.5")}
                  >
                    <Text
                      className={themeClass(user.accountStatus ===
                        "ACTIVE"
                          ? "text-xs font-bold text-emerald-700"
                          : user.accountStatus ===
                              "SUSPENDED"
                            ? "text-xs font-bold text-orange-700"
                            : "text-xs font-bold text-red-700")}
                    >
                      {
                        user.accountStatus
                      }
                    </Text>
                  </View>

                  {user.authProviders?.map(
                    (
                      provider
                    ) => (
                      <View
                        key={
                          provider
                        }
                        className={themeClass("rounded-full bg-slate-100 px-3 py-1.5")}
                      >
                        <Text className={themeClass("text-xs font-semibold text-slate-600")}>
                          {
                            provider
                          }
                        </Text>
                      </View>
                    )
                  )}
                </View>
              </Pressable>
            )
          )
        )}

        {!loading &&
          pagination.totalPages >
            1 && (
          <View className={themeClass("mt-5 flex-row items-center justify-between rounded-3xl border border-slate-200 bg-white p-4")}>
            <Pressable
              disabled={
                !pagination.hasPreviousPage
              }
              onPress={() =>
                setCurrentPage(
                  (
                    previous
                  ) =>
                    Math.max(
                      previous -
                        1,
                      1
                    )
                )
              }
              className={themeClass(`min-h-11 flex-row items-center rounded-xl px-4 ${
                pagination.hasPreviousPage
                  ? "bg-indigo-50"
                  : "bg-slate-100"
              }`)}
            >
              <Ionicons
                name="chevron-back"
                size={18}
                color={
                  pagination.hasPreviousPage
                    ? "#0E7C86"
                    : "#8BA3AB"
                }
              />

              <Text
                className={themeClass(`ml-1 font-semibold ${
                  pagination.hasPreviousPage
                    ? "text-indigo-600"
                    : "text-slate-400"
                }`)}
              >
                Previous
              </Text>
            </Pressable>

            <View className={themeClass("items-center")}>
              <Text className={themeClass("font-bold text-slate-900")}>
                {
                  pagination.page
                }{" "}
                /{" "}
                {
                  pagination.totalPages
                }
              </Text>

              <Text className={themeClass("mt-1 text-xs text-slate-400")}>
                Page
              </Text>
            </View>

            <Pressable
              disabled={
                !pagination.hasNextPage
              }
              onPress={() =>
                setCurrentPage(
                  (
                    previous
                  ) =>
                    Math.min(
                      previous +
                        1,
                      pagination.totalPages
                    )
                )
              }
              className={themeClass(`min-h-11 flex-row items-center rounded-xl px-4 ${
                pagination.hasNextPage
                  ? "bg-indigo-50"
                  : "bg-slate-100"
              }`)}
            >
              <Text
                className={themeClass(`mr-1 font-semibold ${
                  pagination.hasNextPage
                    ? "text-indigo-600"
                    : "text-slate-400"
                }`)}
              >
                Next
              </Text>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={
                  pagination.hasNextPage
                    ? "#0E7C86"
                    : "#8BA3AB"
                }
              />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}