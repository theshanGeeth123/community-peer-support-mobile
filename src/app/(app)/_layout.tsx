import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  View,
} from "react-native";

import {
  Redirect,
  Tabs,
} from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import {
  useAuth,
} from "@/features/auth/hooks/useAuth";

export default function AppLayout() {
  const {
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

  if (!isAuthenticated) {
    return (
      <Redirect href="/(auth)/login" />
    );
  }

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,

        tabBarHideOnKeyboard: true,

        tabBarActiveTintColor:
          "#4f46e5",

        tabBarInactiveTintColor:
          "#94a3b8",

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },

        tabBarItemStyle: {
          paddingTop: 4,
        },

        tabBarStyle: {
          backgroundColor:
            "#ffffff",

          borderTopColor:
            "#e2e8f0",

          borderTopWidth: 1,

          height:
            Platform.OS === "ios"
              ? 88
              : 72,

          paddingTop: 6,

          paddingBottom:
            Platform.OS === "ios"
              ? 24
              : 8,

          elevation: 12,

          shadowColor: "#000",

          shadowOffset: {
            width: 0,
            height: -2,
          },

          shadowOpacity: 0.06,

          shadowRadius: 8,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? "home"
                  : "home-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="community"
        options={{
          title: "Community",

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? "people"
                  : "people-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="groups"
        options={{
          title: "Groups",

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? "chatbubbles"
                  : "chatbubbles-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",

          tabBarIcon: ({
            color,
            size,
            focused,
          }) => (
            <Ionicons
              name={
                focused
                  ? "person"
                  : "person-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="change-password"
        options={{
          href: null,

          tabBarStyle: {
            display: "none",
          },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
});