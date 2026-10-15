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

import ShakeQuickActions from "@/features/safety/components/ShakeQuickActions";

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
          color="#0E7C86"
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
              "#F5FAF9",
          },
        }}
      />

      {/*
       * Shake the phone anywhere in the
       * signed-in app to write a post or
       * call emergency services.
       */}
      <ShakeQuickActions />
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#F5FAF9",
    },

    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#F5FAF9",
    },
  });