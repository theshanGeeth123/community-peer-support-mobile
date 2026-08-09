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

export default function UserLayout() {
  return (
    <RoleAreaGuard
      allowedRole="USER"
    >
      <Tabs
        initialRouteName="home"
        screenOptions={{
          headerShown: false,

          tabBarHideOnKeyboard:
            true,

          tabBarActiveTintColor:
            "#4f46e5",

          tabBarInactiveTintColor:
            "#94a3b8",

          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
            marginTop: 2,
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
                    ? "chatbubbles"
                    : "chatbubbles-outline"
                }
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