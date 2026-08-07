import {
    Redirect,
    Stack,
} from "expo-router";

import {
    useAuth,
} from "@/features/auth/hooks/useAuth";

export default function AdminLayout() {
  const {
    user,
    isAuthenticated,
  } = useAuth();

if (!isAuthenticated) {
  return (
    <Redirect href="/(auth)/login" />
  );
}

if (user?.role !== "ADMIN") {
  return (
    <Redirect href="/(app)/home" />
  );
}

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    />
  );
}