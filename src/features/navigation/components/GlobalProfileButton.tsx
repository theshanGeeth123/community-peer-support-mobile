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

const MAIN_TAB_PATHS = new Set([
  "/user/home",
  "/user/groups",
  "/user/community",

  "/peer-supporter/home",
  "/peer-supporter/my-groups",
  "/peer-supporter/join-requests",
  "/peer-supporter/community",

  "/moderator/home",
  "/moderator/reports",
  "/moderator/groups",
  "/moderator/history",

  "/admin/dashboard",
  "/admin/users",
  "/admin/groups",
  "/admin/reports",
]);

export default function GlobalProfileButton() {
  const pathname =
    usePathname();

  const insets =
    useSafeAreaInsets();

  const { user } =
    useAuth();

  const {
    openDrawer,
  } = useProfileDrawer();

  if (
    !user ||
    !MAIN_TAB_PATHS.has(
      pathname
    )
  ) {
    return null;
  }

  return (
    <Pressable
      onPress={openDrawer}
      hitSlop={8}
      style={[
        styles.button,

        {
          top:
            insets.top + 14,
        },
      ]}
    >
      <UserAvatar
        fullName={
          user.fullName
        }
        avatarUrl={
          user.avatarUrl
        }
        size={43}
      />
    </Pressable>
  );
}

const styles =
  StyleSheet.create({
    button: {
      position: "absolute",

      right: 18,

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

      zIndex: 100,

      elevation: 20,

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