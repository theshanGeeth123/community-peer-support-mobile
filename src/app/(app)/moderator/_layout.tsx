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
          name="community"
          options={{
            title: "Community",

            tabBarIcon: ({
              color,
              size,
            }) => (
              <Ionicons
                name="globe-outline"
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
            }) => (
              <Ionicons
                name="person-circle-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

        {/*
         * Reports and History remain
         * real routes, reachable from
         * Home quick actions, but must
         * NOT appear as bottom tabs.
         */}
        <Tabs.Screen
          name="reports"
          options={{
            href: null,

            tabBarStyle: {
              display: "none",
            },
          }}
        />

        <Tabs.Screen
          name="history"
          options={{
            href: null,

            tabBarStyle: {
              display: "none",
            },
          }}
        />

        {/*
         * Group Details is a real
         * route, but must NOT appear
         * as a bottom tab.
         */}
        <Tabs.Screen
          name="group/[groupId]/posts"
          options={{
            href: null,

            tabBarStyle: {
              display: "none",
            },
          }}
        />

        <Tabs.Screen
          name="group/[groupId]/members"
          options={{
            href: null,

            tabBarStyle: {
              display: "none",
            },
          }}
        />

        <Tabs.Screen
          name="group/[groupId]/report/[reportId]"
          options={{
            href: null,

            tabBarStyle: {
              display: "none",
            },
          }}
        />
      </Tabs>
    </RoleAreaGuard>
  );
}