import {
  ActivityIndicator,
  View,
} from "react-native";

import { Redirect } from "expo-router";

import { useAuth } from "@/features/auth/hooks/useAuth";

export default function IndexScreen() {
  const {
    isAuthenticated,
    isInitializing,
  } = useAuth();

  if (isInitializing) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isAuthenticated) {
    return (
      <Redirect href="/(app)" />
    );
  }

  return (
    <Redirect href="/(auth)/login" />
  );
}