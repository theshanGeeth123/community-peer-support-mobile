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

export default function AppLayout() {
  const {
    isAuthenticated,
    isInitializing,
  } = useAuth();

  if (isInitializing) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color="#4f46e5"
        />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <Redirect
        href="/(auth)/login"
      />
    );
  }

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,

          contentStyle: {
            backgroundColor:
              "#f8fafc",
          },
        }}
      />
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#f8fafc",
    },

    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#f8fafc",
    },
  });