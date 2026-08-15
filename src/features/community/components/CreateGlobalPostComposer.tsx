import { useRef, useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

const MAX_CONTENT_LENGTH = 3000;

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 0 || !parts[0]) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function CreateGlobalPostComposer({
  currentUserName = "You",
  submitting,
  canPin,
  onSubmit,
}: {
  currentUserName?: string;
  submitting: boolean;
  canPin: boolean;
  onSubmit: (content: string, isPinned: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);

  const inputRef = useRef<TextInput | null>(null);

  const canSubmit = content.trim().length > 0 && !submitting;

  const handleExpand = () => {
    setExpanded(true);

    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleCancel = () => {
    setExpanded(false);
    setContent("");
    setIsPinned(false);
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    onSubmit(content.trim(), isPinned);

    setContent("");
    setIsPinned(false);
    setExpanded(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(currentUserName)}
          </Text>
        </View>

        {expanded ? (
          <TextInput
            ref={inputRef}
            value={content}
            onChangeText={setContent}
            editable={!submitting}
            multiline
            textAlignVertical="top"
            maxLength={MAX_CONTENT_LENGTH}
            placeholder="Share an update with the community..."
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />
        ) : (
          <Pressable style={styles.trigger} onPress={handleExpand}>
            <Text style={styles.triggerText}>
              Share an update with the community...
            </Text>
          </Pressable>
        )}
      </View>

      {expanded && (
        <View style={styles.footer}>
          {canPin ? (
            <Pressable
              style={styles.pinToggle}
              onPress={() => setIsPinned((previous) => !previous)}
            >
              <Ionicons
                name={isPinned ? "checkbox" : "square-outline"}
                size={19}
                color="#4f46e5"
              />

              <Text style={styles.pinLabel}>Pin as announcement</Text>
            </Pressable>
          ) : (
            <View />
          )}

          <View style={styles.footerButtons}>
            <Pressable
              disabled={submitting}
              onPress={handleCancel}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>

            <Pressable
              disabled={!canSubmit}
              onPress={handleSubmit}
              style={[
                styles.submitButton,
                !canSubmit && styles.submitDisabled,
              ]}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="send-outline" size={15} color="#ffffff" />

                  <Text style={styles.submitButtonText}>Post</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 20,
    backgroundColor: "#ffffff",

    shadowColor: "#0f172a",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  avatar: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: "#eef2ff",
  },

  avatarText: {
    fontWeight: "800",
    color: "#4f46e5",
  },

  trigger: {
    flex: 1,
    marginLeft: 12,
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 21,
    backgroundColor: "#f8fafc",
  },

  triggerText: {
    fontSize: 14,
    color: "#94a3b8",
  },

  input: {
    flex: 1,
    marginLeft: 12,
    minHeight: 64,
    fontSize: 15,
    lineHeight: 21,
    color: "#0f172a",
  },

  footer: {
    marginTop: 14,
    paddingTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },

  pinToggle: {
    flexDirection: "row",
    alignItems: "center",
  },

  pinLabel: {
    marginLeft: 7,
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },

  footerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },

  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  cancelButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94a3b8",
  },

  submitButton: {
    marginLeft: 6,
    height: 38,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: "#4f46e5",
  },

  submitButtonText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },

  submitDisabled: {
    opacity: 0.5,
  },
});
