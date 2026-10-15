import { useThemeTone, useThemedStyles } from '@/theme/useAlyvenAppearance';
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
  const themeStyles = useThemedStyles(styles);
  const themeTone = useThemeTone();

  const {
    user,
    isAuthenticated,
    isInitializing,
  } = useAuth();

  if (isInitializing) {
    return (
      <View
        style={
          themeStyles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color={themeTone("#0E7C86", "color")}
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
        themeStyles.container
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
        "#F5FAF9",
    },
  });