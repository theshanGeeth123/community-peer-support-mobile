import "../../global.css";

import {
  ActivityIndicator,
  View,
} from "react-native";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import {
  AuthProvider,
} from "@/features/auth/context/AuthContext";

import {
  useAuth,
} from "@/features/auth/hooks/useAuth";

function RootNavigator() {
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

  return (
    <>
      <StatusBar style="dark" />

      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />

        <Stack.Protected
          guard={!isAuthenticated}
        >
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected
          guard={isAuthenticated}
        >
          <Stack.Screen name="(app)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}