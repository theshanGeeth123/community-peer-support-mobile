import type { PropsWithChildren } from "react";

import {
    ActivityIndicator,
    StyleSheet,
    View,
} from "react-native";

import { Redirect } from "expo-router";

import { useAuth } from "@/features/auth/hooks/useAuth";

import type {
    UserRole,
} from "@/features/auth/types/auth.types";

import {
    getRoleHomeRoute,
} from "@/features/navigation/roleNavigation";

interface RoleAreaGuardProps
  extends PropsWithChildren {
  allowedRole: UserRole;
}

export default function RoleAreaGuard({
  allowedRole,
  children,
}: RoleAreaGuardProps) {
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

  if (
    !isAuthenticated ||
    !user
  ) {
    return (
      <Redirect href="/(auth)/login" />
    );
  }

  if (user.role !== allowedRole) {
    return (
      <Redirect
        href={getRoleHomeRoute(
          user.role
        )}
      />
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
});