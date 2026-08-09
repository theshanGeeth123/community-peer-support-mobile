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

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  useAuth,
} from "@/features/auth/hooks/useAuth";

import GlobalProfileButton from "@/features/navigation/components/GlobalProfileButton";
import ProfileDrawer from "@/features/navigation/components/ProfileDrawer";

import {
  ProfileDrawerProvider,
} from "@/features/navigation/context/ProfileDrawerContext";

export default function AppLayout() {
  const {
    user,
    isAuthenticated,
    isInitializing,
  } = useAuth();

  if (isInitializing) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
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

  const isUser =
    user.role === "USER";

  const isPeerSupporter =
    user.role ===
    "PEER_SUPPORTER";

  const isModerator =
    user.role ===
    "MODERATOR";

  const isAdmin =
    user.role === "ADMIN";

  const canViewCommunity =
    isUser ||
    isPeerSupporter;

  return (
    <ProfileDrawerProvider>
      <View style={styles.appContainer}>
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
              fontSize: 10.5,
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
                Platform.OS ===
                "ios"
                  ? 88
                  : 72,

              paddingTop: 6,

              paddingBottom:
                Platform.OS ===
                "ios"
                  ? 24
                  : 8,

              elevation: 12,

              shadowColor:
                "#000000",

              shadowOffset: {
                width: 0,
                height: -2,
              },

              shadowOpacity:
                0.06,

              shadowRadius: 8,
            },
          }}
        >
          <Tabs.Screen
            name="home"
            options={{
              title: isAdmin
                ? "Dashboard"
                : "Home",

              tabBarIcon: ({
                color,
                size,
                focused,
              }) => (
                <Ionicons
                  name={
                    isAdmin
                      ? focused
                        ? "grid"
                        : "grid-outline"
                      : focused
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

              href: isUser
                ? undefined
                : null,

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
            name="peer-groups"
            options={{
              title:
                "My Groups",

              href:
                isPeerSupporter
                  ? undefined
                  : null,

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
            name="peer-join-requests"
            options={{
              title:
                "Requests",

              href:
                isPeerSupporter
                  ? undefined
                  : null,

              tabBarIcon: ({
                color,
                size,
                focused,
              }) => (
                <Ionicons
                  name={
                    focused
                      ? "person-add"
                      : "person-add-outline"
                  }
                  size={size}
                  color={color}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="moderator-reports"
            options={{
              title:
                "Reports",

              href:
                isModerator
                  ? undefined
                  : null,

              tabBarIcon: ({
                color,
                size,
                focused,
              }) => (
                <Ionicons
                  name={
                    focused
                      ? "flag"
                      : "flag-outline"
                  }
                  size={size}
                  color={color}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="moderator-groups"
            options={{
              title:
                "Groups",

              href:
                isModerator
                  ? undefined
                  : null,

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
            name="moderator-history"
            options={{
              title:
                "History",

              href:
                isModerator
                  ? undefined
                  : null,

              tabBarIcon: ({
                color,
                size,
                focused,
              }) => (
                <Ionicons
                  name={
                    focused
                      ? "time"
                      : "time-outline"
                  }
                  size={size}
                  color={color}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="admin-users"
            options={{
              title: "Users",

              href: isAdmin
                ? undefined
                : null,

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
            name="admin-groups"
            options={{
              title: "Groups",

              href: isAdmin
                ? undefined
                : null,

              tabBarIcon: ({
                color,
                size,
                focused,
              }) => (
                <Ionicons
                  name={
                    focused
                      ? "layers"
                      : "layers-outline"
                  }
                  size={size}
                  color={color}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="admin-reports"
            options={{
              title:
                "Reports",

              href: isAdmin
                ? undefined
                : null,

              tabBarIcon: ({
                color,
                size,
                focused,
              }) => (
                <Ionicons
                  name={
                    focused
                      ? "flag"
                      : "flag-outline"
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

              href:
                canViewCommunity
                  ? undefined
                  : null,

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
              href: null,
            }}
          />

          <Tabs.Screen
            name="change-password"
            options={{
              href: null,

              tabBarStyle: {
                display:
                  "none",
              },
            }}
          />
        </Tabs>

        <GlobalProfileButton />

        <ProfileDrawer />
      </View>
    </ProfileDrawerProvider>
  );
}

const styles =
  StyleSheet.create({
    appContainer: {
      flex: 1,
      backgroundColor:
        "#f8fafc",
    },

    loadingContainer: {
      flex: 1,

      alignItems: "center",

      justifyContent:
        "center",

      backgroundColor:
        "#f8fafc",
    },
  });