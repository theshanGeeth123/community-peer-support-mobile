import "../../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import {
  AuthProvider,
} from "@/features/auth/context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      />
    </AuthProvider>
  );
}