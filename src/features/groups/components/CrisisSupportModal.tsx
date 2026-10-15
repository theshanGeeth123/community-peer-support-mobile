import { useThemeTone, useThemedStyles } from '@/theme/useAlyvenAppearance';
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { CRISIS_RESOURCES } from "../constants/crisisResources";

/*
 * Shown right after a user publishes a post that contains
 * crisis language. The post is still published — this sheet
 * only offers immediate support.
 */
export default function CrisisSupportModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const themeStyles = useThemedStyles(styles);
  const themeTone = useThemeTone();

  const handleCall = async (phone: string) => {
    try {
      await Linking.openURL(`tel:${phone}`);
    } catch {
      Alert.alert("Unable to call", `Please dial ${phone} from your phone.`);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={themeStyles.overlay}>
        <View style={themeStyles.sheet}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={themeStyles.sheetContent}
          >
            <View style={themeStyles.iconCircle}>
              <Ionicons name="heart" size={28} color={themeTone("#e11d48", "color")} />
            </View>

            <Text style={themeStyles.title}>You are not alone</Text>

            <Text style={themeStyles.message}>
              Your post has been shared with your group. It sounds like you
              might be going through something really hard right now. Talking
              to someone can help — these services are free and confidential.
            </Text>

            {CRISIS_RESOURCES.map((resource) => (
              <Pressable
                key={resource.phone}
                onPress={() => void handleCall(resource.phone)}
                style={themeStyles.resourceCard}
              >
                <View style={themeStyles.resourceText}>
                  <Text style={themeStyles.resourceName}>{resource.name}</Text>

                  <Text style={themeStyles.resourceDescription}>
                    {resource.description}
                  </Text>
                </View>

                <View style={themeStyles.callButton}>
                  <Ionicons name="call" size={15} color={themeTone("#ffffff", "color")} />

                  <Text style={themeStyles.callButtonText}>
                    {resource.displayPhone}
                  </Text>
                </View>
              </Pressable>
            ))}

            <Text style={themeStyles.footnote}>
              A peer supporter from your group may also reach out to you.
            </Text>

            <Pressable onPress={onClose} style={themeStyles.closeButton}>
              <Text style={themeStyles.closeButtonText}>Close</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
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
    maxHeight: "88%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: "#ffffff",
  },

  sheetContent: {
    padding: 22,
    paddingBottom: 34,
  },

  iconCircle: {
    width: 58,
    height: 58,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 29,
    backgroundColor: "#ffe4e6",
  },

  title: {
    marginTop: 14,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
    color: "#0E2A47",
  },

  message: {
    marginTop: 8,
    marginBottom: 18,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    color: "#4D6C78",
  },

  resourceCard: {
    marginBottom: 10,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0EDEB",
    borderRadius: 16,
    backgroundColor: "#F5FAF9",
  },

  resourceText: {
    flex: 1,
    marginRight: 10,
  },

  resourceName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0E2A47",
  },

  resourceDescription: {
    marginTop: 3,
    fontSize: 12,
    color: "#64808C",
  },

  callButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: "#0E7C86",
  },

  callButtonText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },

  footnote: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 12,
    color: "#8BA3AB",
  },

  closeButton: {
    marginTop: 18,
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
