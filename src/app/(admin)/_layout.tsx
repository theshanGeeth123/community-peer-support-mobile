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

import {
  getRoleHomeRoute,
} from "@/features/navigation/roleNavigation";

export default function AdminLayout() {
  const themeStyles = useThemedStyles(styles);
  const themeTone = useThemeTone();

  const {
    user,
    isAuthenticated,
    isInitializing,
  } = useAuth();

  if (isInitializing) {
    return (
      <View style={themeStyles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={themeTone("#0E7C86", "color")}
        />
      </View>
    );
  }

  if (
    !isAuthenticated ||
    !user
  ) {
    return (
      <Redirect href="/(auth)/login" />
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <Redirect
        href={getRoleHomeRoute(
          user.role
        )}
      />
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",

        contentStyle: {
          backgroundColor: themeTone("#F5FAF9", "backgroundColor"),
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
    backgroundColor: "#F5FAF9",
  },
});