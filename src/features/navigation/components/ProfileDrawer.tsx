import {
    Animated,
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    useEffect,
    useMemo,
    useRef,
} from "react";

import {
    type Href,
    router,
} from "expo-router";

import {
    Ionicons,
} from "@expo/vector-icons";

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

function getRoleLabel(
  role?: string
) {
  switch (role) {
    case "PEER_SUPPORTER":
      return "Peer Supporter";

    case "MODERATOR":
      return "Moderator";

    case "ADMIN":
      return "Administrator";

    default:
      return "User";
  }
}

export default function ProfileDrawer() {
  const {
    isOpen,
    closeDrawer,
  } = useProfileDrawer();

  const {
    user,
    logout,
  } = useAuth();

  const insets =
    useSafeAreaInsets();

  const screenWidth =
    Dimensions.get(
      "window"
    ).width;

  const drawerWidth =
    useMemo(
      () =>
        Math.min(
          screenWidth * 0.84,
          350
        ),
      [screenWidth]
    );

  const translateX =
    useRef(
      new Animated.Value(
        -drawerWidth
      )
    ).current;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    translateX.setValue(
      -drawerWidth
    );

    Animated.timing(
      translateX,
      {
        toValue: 0,
        duration: 220,
        useNativeDriver:
          true,
      }
    ).start();
  }, [
    isOpen,
    drawerWidth,
    translateX,
  ]);

  const handleClose = () => {
    Animated.timing(
      translateX,
      {
        toValue:
          -drawerWidth,
        duration: 180,
        useNativeDriver:
          true,
      }
    ).start(() => {
      closeDrawer();
    });
  };

  const closeThen = (
    callback: () => void
  ) => {
    Animated.timing(
      translateX,
      {
        toValue:
          -drawerWidth,
        duration: 180,
        useNativeDriver:
          true,
      }
    ).start(() => {
      closeDrawer();

      setTimeout(() => {
        callback();
      }, 50);
    });
  };

  const navigateTo = (
    href: Href
  ) => {
    closeThen(() => {
      router.navigate(href);
    });
  };

  const handleLogout = () => {
    closeThen(() => {
      void logout();
    });
  };

  if (!user) {
    return null;
  }

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={
        handleClose
      }
    >
      <View
        style={
          styles.modalContainer
        }
      >
        {/* DARK BACKGROUND
            Tap here to close */}
        <Pressable
          style={
            StyleSheet.absoluteFill
          }
          onPress={
            handleClose
          }
        >
          <View
            style={
              styles.backdrop
            }
          />
        </Pressable>

        {/* DRAWER */}
        <Animated.View
          style={[
            styles.drawer,
            {
              width:
                drawerWidth,

              paddingTop:
                insets.top +
                12,

              paddingBottom:
                Math.max(
                  insets.bottom,
                  20
                ),

              transform: [
                {
                  translateX,
                },
              ],
            },
          ]}
        >
          {/* CLOSE BUTTON */}
          <View
            style={
              styles.topRow
            }
          >
            <Text
              style={
                styles.menuLabel
              }
            >
              Menu
            </Text>

            <Pressable
              onPress={
                handleClose
              }
              hitSlop={10}
              style={({
                pressed,
              }) => [
                styles.closeButton,

                pressed &&
                  styles.closeButtonPressed,
              ]}
            >
              <Ionicons
                name="close"
                size={24}
                color="#475569"
              />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.scrollContent
            }
          >
            {/* USER DETAILS */}
            <View
              style={
                styles.profileSection
              }
            >
              <UserAvatar
                fullName={
                  user.fullName
                }
                avatarUrl={
                  user.avatarUrl
                }
                size={78}
              />

              <Text
                style={
                  styles.name
                }
              >
                {user.fullName}
              </Text>

              <Text
                style={
                  styles.email
                }
                numberOfLines={1}
              >
                {user.email}
              </Text>

              <View
                style={
                  styles.roleBadge
                }
              >
                <Text
                  style={
                    styles.roleText
                  }
                >
                  {getRoleLabel(
                    user.role
                  )}
                </Text>
              </View>
            </View>

            <View
              style={
                styles.divider
              }
            />

            <Text
              style={
                styles.sectionTitle
              }
            >
              Account
            </Text>

            {/* PROFILE */}
            <DrawerItem
              icon="person-outline"
              title="View Profile"
              description="View and update your account details"
              onPress={() =>
                navigateTo(
                  "/(app)/profile"
                )
              }
            />

            {/* PASSWORD */}
            <DrawerItem
              icon="lock-closed-outline"
              title="Change Password"
              description="Manage your account password"
              onPress={() =>
                navigateTo(
                  "/(app)/change-password"
                )
              }
            />

            <View
              style={
                styles.divider
              }
            />

            {/* LOGOUT */}
            <Pressable
              onPress={
                handleLogout
              }
              style={({
                pressed,
              }) => [
                styles.logoutButton,

                pressed &&
                  styles.logoutPressed,
              ]}
            >
              <View
                style={
                  styles.logoutIcon
                }
              >
                <Ionicons
                  name="log-out-outline"
                  size={22}
                  color="#dc2626"
                />
              </View>

              <View
                style={{
                  flex: 1,
                }}
              >
                <Text
                  style={
                    styles.logoutTitle
                  }
                >
                  Sign Out
                </Text>

                <Text
                  style={
                    styles.logoutDescription
                  }
                >
                  Sign out from
                  this device
                </Text>
              </View>
            </Pressable>
          </ScrollView>

          <View
            style={
              styles.footer
            }
          >
            <Text
              style={
                styles.footerText
              }
            >
              Community Peer
              Support
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

interface DrawerItemProps {
  icon:
    | "person-outline"
    | "lock-closed-outline";

  title: string;

  description: string;

  onPress: () => void;
}

function DrawerItem({
  icon,
  title,
  description,
  onPress,
}: DrawerItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({
        pressed,
      }) => [
        styles.menuItem,

        pressed &&
          styles.menuItemPressed,
      ]}
    >
      <View
        style={
          styles.menuIcon
        }
      >
        <Ionicons
          name={icon}
          size={22}
          color="#4f46e5"
        />
      </View>

      <View
        style={{
          flex: 1,
        }}
      >
        <Text
          style={
            styles.menuTitle
          }
        >
          {title}
        </Text>

        <Text
          style={
            styles.menuDescription
          }
        >
          {description}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={19}
        color="#94a3b8"
      />
    </Pressable>
  );
}

const styles =
  StyleSheet.create({
    modalContainer: {
      flex: 1,
    },

    backdrop: {
      flex: 1,
      backgroundColor:
        "rgba(15, 23, 42, 0.50)",
    },

    drawer: {
      position: "absolute",

      top: 0,
      bottom: 0,
      left: 0,

      backgroundColor:
        "#ffffff",

      paddingHorizontal:
        20,

      shadowColor:
        "#000000",

      shadowOffset: {
        width: 4,
        height: 0,
      },

      shadowOpacity:
        0.18,

      shadowRadius: 14,

      elevation: 30,
    },

    topRow: {
      minHeight: 48,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",
    },

    menuLabel: {
      fontSize: 14,

      fontWeight: "700",

      color: "#64748b",
    },

    closeButton: {
      width: 42,
      height: 42,

      borderRadius: 21,

      alignItems: "center",
      justifyContent:
        "center",

      backgroundColor:
        "#f1f5f9",
    },

    closeButtonPressed: {
      backgroundColor:
        "#e2e8f0",
    },

    scrollContent: {
      paddingBottom: 24,
    },

    profileSection: {
      paddingTop: 16,
    },

    name: {
      marginTop: 16,

      fontSize: 23,

      fontWeight: "800",

      color: "#0f172a",
    },

    email: {
      marginTop: 5,

      fontSize: 14,

      color: "#64748b",
    },

    roleBadge: {
      alignSelf:
        "flex-start",

      marginTop: 12,

      paddingHorizontal:
        12,

      paddingVertical: 6,

      borderRadius: 999,

      backgroundColor:
        "#eef2ff",
    },

    roleText: {
      fontSize: 12,

      fontWeight: "700",

      color: "#4338ca",
    },

    divider: {
      height: 1,

      marginVertical: 22,

      backgroundColor:
        "#e2e8f0",
    },

    sectionTitle: {
      marginBottom: 8,

      fontSize: 12,

      fontWeight: "700",

      textTransform:
        "uppercase",

      letterSpacing: 0.8,

      color: "#94a3b8",
    },

    menuItem: {
      minHeight: 70,

      flexDirection: "row",

      alignItems: "center",

      borderRadius: 16,

      paddingHorizontal:
        10,

      paddingVertical: 10,
    },

    menuItemPressed: {
      backgroundColor:
        "#f8fafc",
    },

    menuIcon: {
      width: 44,
      height: 44,

      marginRight: 12,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius: 14,

      backgroundColor:
        "#eef2ff",
    },

    menuTitle: {
      fontSize: 15,

      fontWeight: "700",

      color: "#0f172a",
    },

    menuDescription: {
      marginTop: 3,

      paddingRight: 8,

      fontSize: 12,

      lineHeight: 17,

      color: "#64748b",
    },

    logoutButton: {
      minHeight: 70,

      flexDirection: "row",

      alignItems: "center",

      borderRadius: 16,

      paddingHorizontal:
        10,

      paddingVertical: 10,

      backgroundColor:
        "#fef2f2",
    },

    logoutPressed: {
      backgroundColor:
        "#fee2e2",
    },

    logoutIcon: {
      width: 44,
      height: 44,

      marginRight: 12,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius: 14,

      backgroundColor:
        "#fee2e2",
    },

    logoutTitle: {
      fontSize: 15,

      fontWeight: "700",

      color: "#b91c1c",
    },

    logoutDescription: {
      marginTop: 3,

      fontSize: 12,

      color: "#ef4444",
    },

    footer: {
      borderTopWidth: 1,

      borderTopColor:
        "#e2e8f0",

      paddingTop: 16,
    },

    footerText: {
      textAlign: "center",

      fontSize: 12,

      fontWeight: "600",

      color: "#94a3b8",
    },
  });