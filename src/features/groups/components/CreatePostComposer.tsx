import { useRef, useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
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

export interface ComposerGroupOption {
  id: string;
  name: string;
}

export default function CreatePostComposer({
  currentUserName = "You",
  submitting,
  onSubmit,
  groupOptions,
}: {
  currentUserName?: string;
  submitting: boolean;
  onSubmit: (content: string, isAnonymous: boolean, groupId?: string) => void;
  groupOptions?: ComposerGroupOption[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(
    groupOptions?.[0]?.id
  );

  const inputRef = useRef<TextInput | null>(null);

  const canSubmit =
    content.trim().length > 0 &&
    !submitting &&
    (!groupOptions || Boolean(selectedGroupId));

  const handleExpand = () => {
    setExpanded(true);

    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleCancel = () => {
    setExpanded(false);
    setContent("");
    setIsAnonymous(false);
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    onSubmit(content.trim(), isAnonymous, selectedGroupId);

    setContent("");
    setIsAnonymous(false);
    setExpanded(false);
  };

  const selectedGroupName = groupOptions?.find(
    (option) => option.id === selectedGroupId
  )?.name;

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
            placeholder="What's on your mind?"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />
        ) : (
          <Pressable style={styles.trigger} onPress={handleExpand}>
            <Text style={styles.triggerText}>What's on your mind?</Text>
          </Pressable>
        )}
      </View>

      {expanded && (
        <>
          {groupOptions && groupOptions.length > 1 && (
            <View style={styles.groupPickerSection}>
              <Text style={styles.groupPickerLabel}>Posting to</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.groupChipRow}
              >
                {groupOptions.map((option) => {
                  const active = option.id === selectedGroupId;

                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => setSelectedGroupId(option.id)}
                      style={[
                        styles.groupChip,
                        active && styles.groupChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.groupChipText,
                          active && styles.groupChipTextActive,
                        ]}
                      >
                        {option.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {groupOptions && groupOptions.length === 1 && selectedGroupName && (
            <View style={styles.singleGroupBadge}>
              <Ionicons name="people-outline" size={13} color="#4f46e5" />

              <Text style={styles.singleGroupBadgeText}>
                {selectedGroupName}
              </Text>
            </View>
          )}

          <View style={styles.footer}>
            <Pressable
              style={styles.anonymousToggle}
              onPress={() => setIsAnonymous((previous) => !previous)}
            >
              <Ionicons
                name={isAnonymous ? "checkbox" : "square-outline"}
                size={19}
                color="#4f46e5"
              />

              <Text style={styles.anonymousLabel}>Post anonymously</Text>
            </Pressable>

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

          {isAnonymous && (
            <Text style={styles.anonymousCaption}>
              Your name will be hidden from other members. Moderators can
              still see it if needed.
            </Text>
          )}
        </>
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

  groupPickerSection: {
    marginTop: 14,
  },

  groupPickerLabel: {
    marginBottom: 7,
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  groupChipRow: {
    gap: 8,
  },

  groupChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },

  groupChipActive: {
    borderColor: "#4f46e5",
    backgroundColor: "#eef2ff",
  },

  groupChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },

  groupChipTextActive: {
    color: "#4f46e5",
  },

  singleGroupBadge: {
    marginTop: 12,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#eef2ff",
  },

  singleGroupBadgeText: {
    marginLeft: 5,
    fontSize: 11,
    fontWeight: "700",
    color: "#4f46e5",
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

  anonymousToggle: {
    flexDirection: "row",
    alignItems: "center",
  },

  anonymousLabel: {
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

  anonymousCaption: {
    marginTop: 10,
    fontSize: 11,
    lineHeight: 16,
    color: "#94a3b8",
  },
});
