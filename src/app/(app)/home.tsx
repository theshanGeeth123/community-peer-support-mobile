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

import {
    useAuth,
} from "@/features/auth/hooks/useAuth";

export default function HomeScreen() {
  const {
    user,
    logout,
  } = useAuth();

  const handleLogout = async () => {
    await logout();

    router.replace(
      "/(auth)/login"
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-10 pt-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="rounded-3xl bg-indigo-600 p-6">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-sm font-semibold uppercase tracking-wider text-indigo-200">
                Community Peer Support
              </Text>

              <Text className="mt-3 text-3xl font-bold text-white">
                Welcome, {user?.fullName}
              </Text>

              <Text className="mt-3 leading-6 text-indigo-100">
                Your account is securely connected
                to the Community Peer Support
                platform.
              </Text>
            </View>

            <Pressable
              onPress={() =>
                router.push(
                  "/(app)/profile"
                )
              }
              className="h-12 w-12 items-center justify-center rounded-full bg-white/15"
            >
              <Text className="text-xl">
                ⚙
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="mt-6 flex-row gap-3">
          <View className="flex-1 rounded-3xl border border-slate-200 bg-white p-5">
            <Text className="text-sm text-slate-400">
              Role
            </Text>

            <Text className="mt-2 font-bold text-slate-900">
              {user?.role}
            </Text>
          </View>

          <View className="flex-1 rounded-3xl border border-slate-200 bg-white p-5">
            <Text className="text-sm text-slate-400">
              Status
            </Text>

            <Text className="mt-2 font-bold text-emerald-600">
              {user?.accountStatus}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() =>
            router.push(
              "/(app)/profile"
            )
          }
          className="mt-6 rounded-3xl border border-slate-200 bg-white p-6"
        >
          <Text className="text-xl font-bold text-slate-900">
            My Profile
          </Text>

          <Text className="mt-2 leading-6 text-slate-500">
            Update your information and manage
            account security.
          </Text>

          <Text className="mt-4 font-semibold text-indigo-600">
            Manage profile →
          </Text>
        </Pressable>

        {user?.role === "ADMIN" && (
          <Pressable
            onPress={() =>
              router.push(
                "/(admin)/users"
              )
            }
            className="mt-4 rounded-3xl bg-slate-900 p-6"
          >
            <Text className="text-xl font-bold text-white">
              Admin Dashboard
            </Text>

            <Text className="mt-2 leading-6 text-slate-300">
              Manage users, roles and account
              access.
            </Text>
          </Pressable>
        )}

        <Pressable
          onPress={() =>
            void handleLogout()
          }
          className="mt-6 min-h-14 items-center justify-center rounded-2xl border border-red-200 bg-red-50"
        >
          <Text className="font-bold text-red-600">
            Sign Out
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}