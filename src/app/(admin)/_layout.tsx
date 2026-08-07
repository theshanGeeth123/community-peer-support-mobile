import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import {
  Redirect,
  Stack,
} from "expo-router";

import {
  useAuth,
} from "@/features/auth/hooks/useAuth";

export default function AdminLayout() {
  const {
    user,
    isAuthenticated,
    isInitializing,
  } = useAuth();

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#4f46e5"
        />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <Redirect href="/(auth)/login" />
    );
  }

  if (user?.role !== "ADMIN") {
    return (
      <Redirect href="/(app)/home" />
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",

        contentStyle: {
          backgroundColor: "#f8fafc",
        },
      }}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
});