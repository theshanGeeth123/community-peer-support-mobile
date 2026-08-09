import {
    Pressable,
    StyleSheet,
} from "react-native";

import {
    usePathname,
} from "expo-router";

import {
    useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
    useAuth,
} from "@/features/auth/hooks/useAuth";

import {
    useProfileDrawer,
} from "@/features/navigation/context/ProfileDrawerContext";

import UserAvatar from "./UserAvatar";

const MAIN_TAB_PATHS = [
  "/home",

  "/groups",
  "/community",

  "/peer-groups",
  "/peer-join-requests",

  "/moderator-reports",
  "/moderator-groups",
  "/moderator-history",

  "/admin-users",
  "/admin-groups",
  "/admin-reports",
];

export default function GlobalProfileButton() {
  const pathname =
    usePathname();

  const insets =
    useSafeAreaInsets();

  const { user } =
    useAuth();

  const { openDrawer } =
    useProfileDrawer();

  const shouldShow =
    MAIN_TAB_PATHS.includes(
      pathname
    );

  if (
    !shouldShow ||
    !user
  ) {
    return null;
  }

  return (
    <Pressable
      onPress={openDrawer}
      style={[
        styles.button,
        {
          top:
            insets.top + 16,
        },
      ]}
      hitSlop={8}
    >
      <UserAvatar
        fullName={
          user.fullName
        }
        avatarUrl={
          user.avatarUrl
        }
        size={44}
      />
    </Pressable>
  );
}

const styles =
  StyleSheet.create({
    button: {
      position: "absolute",
      right: 20,
      zIndex: 100,
      elevation: 20,

      width: 48,
      height: 48,

      borderRadius: 24,

      alignItems: "center",
      justifyContent:
        "center",

      backgroundColor:
        "#ffffff",

      borderWidth: 2,
      borderColor:
        "#ffffff",

      shadowColor:
        "#000000",

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity: 0.12,
      shadowRadius: 5,
    },
  });