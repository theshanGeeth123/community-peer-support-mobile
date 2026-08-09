import {
    type PropsWithChildren,
} from "react";

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

import type {
    UserRole,
} from "@/features/auth/types/auth.types";

type RoleGuardProps =
  PropsWithChildren<{
    allowedRoles: UserRole[];
  }>;

export default function RoleGuard({
  allowedRoles,
  children,
}: RoleGuardProps) {
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
    !isAuthenticated ||
    !user
  ) {
    return (
      <Redirect href="/(auth)/login" />
    );
  }

  if (
    !allowedRoles.includes(
      user.role
    )
  ) {
    return (
      <Redirect href="/(app)/home" />
    );
  }

  return <>{children}</>;
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        "#f8fafc",
    },
  });