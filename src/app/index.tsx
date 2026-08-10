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
  const {
    user,
    isAuthenticated,
    isInitializing,
  } = useAuth();

  if (isInitializing) {
    return (
      <View style={styles.container}>
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
        "#f8fafc",
    },
  });