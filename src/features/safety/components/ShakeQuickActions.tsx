import { useThemeTone, useThemedStyles } from '@/theme/useAlyvenAppearance';
import { useCallback, useState } from "react";

import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";

import { type Href, router } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import type { UserRole } from "@/features/auth/types/auth.types";
import { useAuth } from "@/features/auth/hooks/useAuth";

import { CRISIS_RESOURCES } from "@/features/groups/constants/crisisResources";

import { useShakeDetector } from "../hooks/useShakeDetector";

/*
 * Where "Write a post" goes for each role. Members get their groups
 * screen with the post box already open; staff pick a group first.
 */
function getWritePostRoute(role: UserRole): Href {
  switch (role) {
    case "USER":
      return {
        pathname: "/(app)/user/groups",
        params: { compose: String(Date.now()) },
      } as Href;

    case "PEER_SUPPORTER":
      return "/(app)/peer-supporter/my-groups" as Href;

    case "MODERATOR":
      return "/(app)/moderator/groups" as Href;

    case "ADMIN":
    default:
      return "/(app)/admin/groups" as Href;
  }
}

const EMERGENCY_PHONE = "1990";

/*
|--------------------------------------------------------------------------
| SHAKE FOR HELP
|--------------------------------------------------------------------------
|
| Mounted once for the whole signed-in app. Shaking the phone opens a
| sheet to quickly write a post or call emergency services / helplines.
| Calls open the phone's dialer, so nothing is ever dialled without the
| user pressing call themselves.
|
*/

export default function ShakeQuickActions() {
  const themeStyles = useThemedStyles(styles);
  const themeTone = useThemeTone();

  const { user } = useAuth();

  const [visible, setVisible] = useState(false);

  const handleShake = useCallback(() => {
    Vibration.vibrate(60);
    setVisible(true);
  }, []);

  /*
   * Paused while the sheet is open, so shaking again does nothing.
   */
  useShakeDetector(handleShake, Boolean(user) && !visible);

  const close = () => setVisible(false);

  const handleWritePost = () => {
    if (!user) {
      return;
    }

    close();
    router.push(getWritePostRoute(user.role));
  };

  const handleCall = async (phone: string) => {
    try {
      await Linking.openURL(`tel:${phone}`);
    } catch {
      Alert.alert("Unable to call", `Please dial ${phone} from your phone.`);
    }
  };

  const emergency = CRISIS_RESOURCES.find(
    (resource) => resource.phone === EMERGENCY_PHONE
  );

  const helplines = CRISIS_RESOURCES.filter(
    (resource) => resource.phone !== EMERGENCY_PHONE
  );

  const isMember = user?.role === "USER";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={close}
    >
      <Pressable style={themeStyles.overlay} onPress={close}>
        {/*
         * Inner Pressable stops taps inside the sheet from closing it.
         */}
        <Pressable style={themeStyles.sheet} onPress={() => undefined}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={themeStyles.sheetContent}
          >
            <View style={themeStyles.handle} />

            <Text style={themeStyles.title}>How can we help?</Text>

            <Text style={themeStyles.subtitle}>
              You shook your phone. Choose an option, or close this if it
              was an accident.
            </Text>

            {/* WRITE A POST */}

            <Pressable onPress={handleWritePost} style={themeStyles.postCard}>
              <View style={themeStyles.postIcon}>
                <Ionicons name="create-outline" size={24} color={themeTone("#0E7C86", "color")} />
              </View>

              <View style={themeStyles.cardText}>
                <Text style={themeStyles.cardTitle}>Write a post</Text>

                <Text style={themeStyles.cardDescription}>
                  {isMember
                    ? "Share what's on your mind with your group."
                    : "Choose one of your groups to post in."}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color={themeTone("#8BA3AB", "color")} />
            </Pressable>

            {/* EMERGENCY */}

            {emergency && (
              <Pressable
                onPress={() => void handleCall(emergency.phone)}
                style={themeStyles.emergencyCard}
              >
                <View style={themeStyles.emergencyIcon}>
                  <Ionicons name="call" size={24} color={themeTone("#ffffff", "color")} />
                </View>

                <View style={themeStyles.cardText}>
                  <Text style={themeStyles.emergencyTitle}>
                    Call emergency · {emergency.displayPhone}
                  </Text>

                  <Text style={themeStyles.emergencyDescription}>
                    {emergency.name} — if you or someone else is in
                    immediate danger.
                  </Text>
                </View>
              </Pressable>
            )}

            {/* HELPLINES */}

            <Text style={themeStyles.sectionLabel}>Talk to someone now</Text>

            {helplines.map((resource) => (
              <Pressable
                key={resource.phone}
                onPress={() => void handleCall(resource.phone)}
                style={themeStyles.helplineRow}
              >
                <View style={themeStyles.cardText}>
                  <Text style={themeStyles.helplineName}>{resource.name}</Text>

                  <Text style={themeStyles.helplineDescription}>
                    {resource.description}
                  </Text>
                </View>

                <View style={themeStyles.callPill}>
                  <Ionicons name="call" size={13} color={themeTone("#0E7C86", "color")} />

                  <Text style={themeStyles.callPillText}>
                    {resource.displayPhone}
                  </Text>
                </View>
              </Pressable>
            ))}

            <Pressable onPress={close} style={themeStyles.closeButton}>
              <Text style={themeStyles.closeButtonText}>Close</Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },

  sheet: {
    maxHeight: "90%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: "#ffffff",
  },

  sheetContent: {
    padding: 20,
    paddingBottom: 34,
  },

  handle: {
    width: 42,
    height: 5,
    marginBottom: 16,
    alignSelf: "center",
    borderRadius: 3,
    backgroundColor: "#E0EDEB",
  },

  title: {
    fontSize: 21,
    fontWeight: "800",
    color: "#0E2A47",
  },

  subtitle: {
    marginTop: 5,
    marginBottom: 18,
    fontSize: 13,
    lineHeight: 19,
    color: "#64808C",
  },

  postCard: {
    marginBottom: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#B7E7DA",
    borderRadius: 20,
    backgroundColor: "#EAF8F5",
  },

  postIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#ffffff",
  },

  cardText: {
    flex: 1,
    marginHorizontal: 12,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0E2A47",
  },

  cardDescription: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: "#4D6C78",
  },

  emergencyCard: {
    marginBottom: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#be123c",
  },

  emergencyIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
  },

  emergencyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
  },

  emergencyDescription: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: "#ffe4e6",
  },

  sectionLabel: {
    marginBottom: 8,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: "#8BA3AB",
  },

  helplineRow: {
    marginBottom: 8,
    paddingVertical: 12,
    paddingLeft: 2,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EDF5F4",
  },

  helplineName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0E2A47",
  },

  helplineDescription: {
    marginTop: 2,
    fontSize: 12,
    color: "#64808C",
  },

  callPill: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    backgroundColor: "#EAF8F5",
  },

  callPillText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0E7C86",
  },

  closeButton: {
    marginTop: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: "#EDF5F4",
  },

  closeButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#31515F",
  },
});
