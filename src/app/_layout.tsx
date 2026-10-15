import "../../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ThemeProvider, useTheme } from "@/theme/ThemeProvider";

import { AuthProvider } from "@/features/auth/context/AuthContext";

function ThemedAppRoot() {
  const { isDark } = useTheme();
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return <ThemeProvider><ThemedAppRoot /></ThemeProvider>;
}
