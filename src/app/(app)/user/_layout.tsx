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
            "#0E7C86",

          tabBarInactiveTintColor:
            "#8BA3AB",

          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight:
              "600",
            marginTop: 2,
          },

          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: Platform.OS === 'ios' ? 90 : 76,
            paddingTop: 11,
            paddingBottom: Platform.OS === 'ios' ? 26 : 9,
            shadowColor: '#0E2A47',
            shadowOffset: { width: 0, height: -5 },
            shadowOpacity: 0.07,
            shadowRadius: 14,
            elevation: 12,
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
            title:
              "Community",

            tabBarIcon: ({
              color,
              size,
              focused,
            }) => (
              <Ionicons
                name={
                  focused
                    ? "globe"
                    : "globe-outline"
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
            title:
              "Profile",

            tabBarIcon: ({
              color,
              size,
              focused,
            }) => (
              <Ionicons
                name={
                  focused
                    ? "person-circle"
                    : "person-circle-outline"
                }
                size={size}
                color={color}
              />
            ),
          }}
        />

        {/*
         * Group Details is a real
         * route, but must NOT appear
         * as a bottom tab.
         */}
        <Tabs.Screen
          name="group/[groupId]/index"
          options={{
            href: null,

            tabBarStyle: {
              display: "none",
            },
          }}
        />

        <Tabs.Screen
          name="group/[groupId]/posts"
          options={{
            href: null,

            tabBarStyle: {
              display: "none",
            },
          }}
        />

        {/*
         * Discover is a real route,
         * reached via a button on the
         * Groups tab, not a bottom tab.
         */}
        <Tabs.Screen
          name="discover"
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