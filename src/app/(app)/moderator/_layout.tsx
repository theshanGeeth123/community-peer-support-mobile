import {
    Platform,
} from "react-native";

import {
    Tabs,
} from "expo-router";

import {
    Ionicons,
} from "@expo/vector-icons";

import RoleAreaGuard from "@/features/navigation/components/RoleAreaGuard";

export default function ModeratorLayout() {
  return (
    <RoleAreaGuard
      allowedRole="MODERATOR"
    >
      <Tabs
        initialRouteName="home"
        screenOptions={{
          headerShown: false,

          tabBarActiveTintColor:
            "#4f46e5",

          tabBarInactiveTintColor:
            "#94a3b8",

          tabBarHideOnKeyboard:
            true,

          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "600",
          },

          tabBarStyle: {
            height:
              Platform.OS === "ios"
                ? 88
                : 72,

            paddingTop: 6,

            paddingBottom:
              Platform.OS === "ios"
                ? 24
                : 8,

            backgroundColor:
              "#ffffff",

            borderTopColor:
              "#e2e8f0",
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
            }) => (
              <Ionicons
                name="home-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="reports"
          options={{
            title: "Reports",

            tabBarIcon: ({
              color,
              size,
            }) => (
              <Ionicons
                name="flag-outline"
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
            }) => (
              <Ionicons
                name="people-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="history"
          options={{
            title: "History",

            tabBarIcon: ({
              color,
              size,
            }) => (
              <Ionicons
                name="time-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </RoleAreaGuard>
  );
}