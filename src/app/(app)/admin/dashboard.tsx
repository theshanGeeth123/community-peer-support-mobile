import {
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";

import {
    SafeAreaView,
} from "react-native-safe-area-context";

import {
    type Href,
    router,
} from "expo-router";

import {
    Ionicons,
} from "@expo/vector-icons";

import {
    useAuth,
} from "@/features/auth/hooks/useAuth";

export default function AdminDashboardScreen() {
  const { user } = useAuth();

  const firstName =
    user?.fullName
      ?.trim()
      .split(" ")[0] ??
    "there";

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
        contentContainerClassName="px-5 pb-8 pt-4"
        showsVerticalScrollIndicator={
          false
        }
      >
        <View className="mb-6">
          <Text className="text-sm font-medium text-slate-500">
            Welcome back
          </Text>

          <Text className="mt-1 text-3xl font-bold text-slate-900">
            Hi, {firstName}
          </Text>
        </View>

        <View className="overflow-hidden rounded-3xl bg-indigo-600 p-6">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-sm font-semibold uppercase tracking-wider text-indigo-200">
                Administrator
              </Text>

              <Text className="mt-3 text-2xl font-bold leading-8 text-white">
                Manage the platform.
              </Text>

              <Text className="mt-3 leading-6 text-indigo-100">
                Manage users and review
                escalated reports here.
              </Text>
            </View>

            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
              <Ionicons
                name="grid"
                size={28}
                color="white"
              />
            </View>
          </View>
        </View>

        <Text className="mb-4 mt-8 text-xl font-bold text-slate-900">
          Quick Actions
        </Text>

        <Pressable
          onPress={() =>
            router.push(
              "/(app)/admin/users" as Href
            )
          }
          className="mb-3 flex-row items-center rounded-3xl border border-slate-200 bg-white p-5"
        >
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-violet-50">
            <Ionicons
              name="people-outline"
              size={24}
              color="#7c3aed"
            />
          </View>

          <View className="ml-4 flex-1">
            <Text className="text-base font-bold text-slate-900">
              Users
            </Text>

            <Text className="mt-1 text-sm leading-5 text-slate-500">
              Manage users, roles and
              account access.
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
            router.push(
              "/(app)/admin/reports" as Href
            )
          }
          className="flex-row items-center rounded-3xl border border-slate-200 bg-white p-5"
        >
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-rose-50">
            <Ionicons
              name="flag-outline"
              size={24}
              color="#e11d48"
            />
          </View>

          <View className="ml-4 flex-1">
            <Text className="text-base font-bold text-slate-900">
              Reports
            </Text>

            <Text className="mt-1 text-sm leading-5 text-slate-500">
              Review escalated
              moderation cases.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#94a3b8"
          />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
