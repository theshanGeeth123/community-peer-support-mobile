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

import ShakeQuickActions from "@/features/safety/components/ShakeQuickActions";

export default function AppLayout() {
  const themeStyles = useThemedStyles(styles);
  const themeTone = useThemeTone();

  const {
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

  if (!isAuthenticated) {
    return (
      <Redirect
        href="/(auth)/login"
      />
    );
  }

  return (
    <View style={themeStyles.container}>
      <Stack
        screenOptions={{
          headerShown: false,

          contentStyle: {
            backgroundColor:
              themeTone("#F5FAF9", "backgroundColor"),
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