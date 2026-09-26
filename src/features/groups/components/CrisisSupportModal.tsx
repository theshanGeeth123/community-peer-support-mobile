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
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="heart" size={28} color="#e11d48" />
            </View>

            <Text style={styles.title}>You are not alone</Text>

            <Text style={styles.message}>
              Your post has been shared with your group. It sounds like you
              might be going through something really hard right now. Talking
              to someone can help — these services are free and confidential.
            </Text>

            {CRISIS_RESOURCES.map((resource) => (
              <Pressable
                key={resource.phone}
                onPress={() => void handleCall(resource.phone)}
                style={styles.resourceCard}
              >
                <View style={styles.resourceText}>
                  <Text style={styles.resourceName}>{resource.name}</Text>

                  <Text style={styles.resourceDescription}>
                    {resource.description}
                  </Text>
                </View>

                <View style={styles.callButton}>
                  <Ionicons name="call" size={15} color="#ffffff" />

                  <Text style={styles.callButtonText}>
                    {resource.displayPhone}
                  </Text>
                </View>
              </Pressable>
            ))}

            <Text style={styles.footnote}>
              A peer supporter from your group may also reach out to you.
            </Text>

            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
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
    color: "#0f172a",
  },

  message: {
    marginTop: 8,
    marginBottom: 18,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    color: "#475569",
  },

  resourceCard: {
    marginBottom: 10,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    backgroundColor: "#f8fafc",
  },

  resourceText: {
    flex: 1,
    marginRight: 10,
  },

  resourceName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },

  resourceDescription: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748b",
  },

  callButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: "#4f46e5",
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
    color: "#94a3b8",
  },

  closeButton: {
    marginTop: 18,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
  },

  closeButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#334155",
  },
});
