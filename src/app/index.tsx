import { useThemeTone, useThemedStyles } from '@/theme/useAlyvenAppearance';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import {
  Redirect,
} from "expo-router";

import {
  useAuth,
} from "@/features/auth/hooks/useAuth";

import {
  getRoleHomeRoute,
} from "@/features/navigation/roleNavigation";

export default function IndexScreen() {
  const themeStyles = useThemedStyles(styles);
  const themeTone = useThemeTone();

  const {
    user,
    isAuthenticated,
    isInitializing,
  } = useAuth();

  if (isInitializing) {
    return (
      <View style={themeStyles.container}>
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
    <Redirect
      href="/(auth)/login"
    />
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      alignItems: "center",

      justifyContent:
        "center",

      backgroundColor:
        "#F5FAF9",
    },
  });