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
    <Stack
      screenOptions={{
        headerShown: false,

        animation:
          "slide_from_right",
      }}
    />
  );
}

const styles =
  StyleSheet.create({
    loadingContainer: {
      flex: 1,

      alignItems: "center",

      justifyContent:
        "center",

      backgroundColor:
        "#f8fafc",
    },
  });