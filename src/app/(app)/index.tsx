import {
    Pressable,
    SafeAreaView,
    Text,
    View,
} from "react-native";

import { useAuth } from "@/features/auth/hooks/useAuth";

export default function HomeScreen() {
  const {
    user,
    logout,
  } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 px-6 pt-10">
        <View className="rounded-3xl bg-indigo-600 p-6">
          <Text className="text-sm font-semibold uppercase tracking-wider text-indigo-200">
            Community Peer Support
          </Text>

          <Text className="mt-3 text-3xl font-bold text-white">
            Welcome, {user?.fullName}
          </Text>

          <Text className="mt-2 text-indigo-100">
            Your authentication session is active.
          </Text>
        </View>

        <View className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
          <Text className="text-sm text-slate-400">
            Email
          </Text>

          <Text className="mt-1 text-base font-semibold text-slate-800">
            {user?.email}
          </Text>

          <Text className="mt-5 text-sm text-slate-400">
            Role
          </Text>

          <Text className="mt-1 text-base font-semibold text-slate-800">
            {user?.role}
          </Text>

          <Text className="mt-5 text-sm text-slate-400">
            Login methods
          </Text>

          <Text className="mt-1 text-base font-semibold text-slate-800">
            {user?.authProviders.join(", ")}
          </Text>
        </View>

        <Pressable
          onPress={() => void logout()}
          className="mt-6 min-h-14 items-center justify-center rounded-2xl border border-red-200 bg-red-50"
        >
          <Text className="font-bold text-red-600">
            Sign out
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}