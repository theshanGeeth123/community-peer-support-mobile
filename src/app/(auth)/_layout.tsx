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

import PublicChatbotWidget from "@/features/chatbot/components/PublicChatbotWidget";

import {
  getRoleHomeRoute,
} from "@/features/navigation/roleNavigation";

export default function AuthLayout() {
  const {
    user,
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

  if (
    isAuthenticated &&
    user
  ) {
    return (
      <Redirect
        href={getRoleHomeRoute(
          user.role
        )}
      />
    );
  }

  return (
    <View
      style={
        styles.container
      }
    >
      <Stack
        screenOptions={{
          headerShown:
            false,

          animation:
            "slide_from_right",
        }}
      />

      {/*
       * Public floating chatbot.
       *
       * It is available on:
       * - Login
       * - Register
       * - Verify Email
       * - Forgot Password
       * - Reset Password
       *
       * Authenticated role areas are
       * not modified.
       */}
      <PublicChatbotWidget />
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    loadingContainer: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#f8fafc",
    },
  });