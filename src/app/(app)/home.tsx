import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import { router } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import {
  useAuth,
} from "@/features/auth/hooks/useAuth";

export default function HomeScreen() {
  const { user } = useAuth();

  const firstName =
    user?.fullName
      ?.trim()
      .split(" ")[0] || "there";

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#f8fafc",
      }}
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8 pt-4"
        showsVerticalScrollIndicator={
          false
        }
      >
        <View className="mb-6 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-sm font-medium text-slate-500">
              Welcome back
            </Text>

            <Text className="mt-1 text-3xl font-bold text-slate-900">
              Hi, {firstName}
            </Text>
          </View>

          <Pressable
            onPress={() =>
              router.navigate(
                "/(app)/profile"
              )
            }
            className="h-12 w-12 items-center justify-center rounded-full bg-indigo-100"
          >
            <Text className="text-lg font-bold text-indigo-700">
              {user?.fullName
                ?.charAt(0)
                .toUpperCase() ||
                "U"}
            </Text>
          </Pressable>
        </View>

        <View className="overflow-hidden rounded-3xl bg-indigo-600 p-6">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-sm font-semibold uppercase tracking-wider text-indigo-200">
                Community Peer Support
              </Text>

              <Text className="mt-3 text-2xl font-bold leading-8 text-white">
                You don't have to navigate everything alone.
              </Text>

              <Text className="mt-3 leading-6 text-indigo-100">
                Connect with supportive
                communities and find resources
                designed to help you move
                forward.
              </Text>
            </View>

            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
              <Ionicons
                name="heart"
                size={28}
                color="white"
              />
            </View>
          </View>
        </View>

        <View className="mt-5 flex-row gap-3">
          <View className="flex-1 rounded-3xl border border-slate-200 bg-white p-5">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
              <Ionicons
                name="person-outline"
                size={20}
                color="#4f46e5"
              />
            </View>

            <Text className="mt-4 text-xs font-medium uppercase text-slate-400">
              Account Role
            </Text>

            <Text className="mt-1 text-sm font-bold text-slate-900">
              {user?.role}
            </Text>
          </View>

          <View className="flex-1 rounded-3xl border border-slate-200 bg-white p-5">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <Ionicons
                name="shield-checkmark-outline"
                size={21}
                color="#059669"
              />
            </View>

            <Text className="mt-4 text-xs font-medium uppercase text-slate-400">
              Account
            </Text>

            <Text className="mt-1 text-sm font-bold text-emerald-600">
              {user?.accountStatus}
            </Text>
          </View>
        </View>

        <Text className="mb-4 mt-8 text-xl font-bold text-slate-900">
          Quick Actions
        </Text>

        <Pressable
          onPress={() =>
            router.navigate(
              "/(app)/community"
            )
          }
          className="mb-3 flex-row items-center rounded-3xl border border-slate-200 bg-white p-5"
        >
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
            <Ionicons
              name="people-outline"
              size={24}
              color="#4f46e5"
            />
          </View>

          <View className="ml-4 flex-1">
            <Text className="text-base font-bold text-slate-900">
              Community
            </Text>

            <Text className="mt-1 text-sm leading-5 text-slate-500">
              Discover supportive people and
              useful resources.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#94a3b8"
          />
        </Pressable>

        <Pressable
          onPress={() =>
            router.navigate(
              "/(app)/groups"
            )
          }
          className="mb-3 flex-row items-center rounded-3xl border border-slate-200 bg-white p-5"
        >
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-violet-50">
            <Ionicons
              name="chatbubbles-outline"
              size={24}
              color="#7c3aed"
            />
          </View>

          <View className="ml-4 flex-1">
            <Text className="text-base font-bold text-slate-900">
              Support Groups
            </Text>

            <Text className="mt-1 text-sm leading-5 text-slate-500">
              Explore groups based on shared
              interests and support needs.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#94a3b8"
          />
        </Pressable>

        <Pressable
          onPress={() =>
            router.navigate(
              "/(app)/profile"
            )
          }
          className="flex-row items-center rounded-3xl border border-slate-200 bg-white p-5"
        >
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-sky-50">
            <Ionicons
              name="person-circle-outline"
              size={26}
              color="#0284c7"
            />
          </View>

          <View className="ml-4 flex-1">
            <Text className="text-base font-bold text-slate-900">
              My Profile
            </Text>

            <Text className="mt-1 text-sm leading-5 text-slate-500">
              Update account details and manage
              security.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#94a3b8"
          />
        </Pressable>

        {user?.role === "ADMIN" && (
          <>
            <Text className="mb-4 mt-8 text-xl font-bold text-slate-900">
              Administration
            </Text>

            <Pressable
              onPress={() =>
                router.push(
                  "/(admin)/users"
                )
              }
              className="rounded-3xl bg-slate-900 p-6"
            >
              <View className="flex-row items-center">
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <Ionicons
                    name="settings-outline"
                    size={24}
                    color="white"
                  />
                </View>

                <View className="ml-4 flex-1">
                  <Text className="text-lg font-bold text-white">
                    Admin Dashboard
                  </Text>

                  <Text className="mt-1 text-sm leading-5 text-slate-300">
                    Manage users, roles and
                    account access.
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#cbd5e1"
                />
              </View>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}