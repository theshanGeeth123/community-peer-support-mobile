import { useThemeTone } from '@/theme/useAlyvenAppearance';
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

export default function PeerSupporterLayout() {
  const themeTone = useThemeTone();

  return (
    <RoleAreaGuard
      allowedRole="PEER_SUPPORTER"
    >
      <Tabs
        initialRouteName="home"
        screenOptions={{
          headerShown: false,

          tabBarHideOnKeyboard:
            true,

          tabBarActiveTintColor:
            themeTone("#0E7C86", "color"),

          tabBarInactiveTintColor:
            themeTone("#8BA3AB", "color"),

          tabBarLabelStyle: {
            fontSize: 11,

            fontWeight:
              "600",

            marginTop: 2,
          },

          tabBarStyle: {
            backgroundColor: themeTone('#FFFFFF', "backgroundColor"),
            borderTopWidth: 0,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: Platform.OS === 'ios' ? 90 : 76,
            paddingTop: 11,
            paddingBottom: Platform.OS === 'ios' ? 26 : 9,
            shadowColor: themeTone('#0E2A47', "shadowColor"),
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
          name="my-groups"
          options={{
            title:
              "Groups",

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
         * Requests remains a real
         * route, reachable from Home
         * quick actions, but must NOT
         * appear as a bottom tab.
         */}
        <Tabs.Screen
          name="join-requests"
          options={{
            href: null,

            tabBarStyle: {
              display: "none",
            },
          }}
        />

        <Tabs.Screen
          name="needs-response"
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
      </Tabs>
    </RoleAreaGuard>
  );
}