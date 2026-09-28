import { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";

import { Ionicons } from "@expo/vector-icons";

import {
  CONTENT_WARNING_LABELS,
  CONTENT_WARNING_OPTIONS,
} from "../constants/contentWarnings";

import type {
  ContentWarning,
  CreatePostPayload,
  PostImageFile,
} from "../types/post.types";

const MAX_CONTENT_LENGTH = 3000;

/*
 * Same limits as the backend upload middleware.
 */
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function getDefaultImageFileName(mimeType?: string | null) {
  if (mimeType === "image/png") {
    return `post-${Date.now()}.png`;
  }

  if (mimeType === "image/webp") {
    return `post-${Date.now()}.webp`;
  }

  return `post-${Date.now()}.jpg`;
}

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
  autoExpandKey,
}: {
  currentUserName?: string;
  submitting: boolean;
  /*
   * Resolve to true when the post was created. The form is cleared
   * only then, so a failed upload never loses the text or photo.
   */
  onSubmit: (
    payload: CreatePostPayload,
    groupId?: string
  ) => Promise<boolean>;
  groupOptions?: ComposerGroupOption[];

  /*
   * Whenever this changes to a new value, the composer opens and
   * focuses the text box (used by "shake → Write a post").
   */
  autoExpandKey?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [image, setImage] = useState<PostImageFile | null>(null);

  const [showWarningPicker, setShowWarningPicker] = useState(false);
  const [contentWarnings, setContentWarnings] = useState<ContentWarning[]>(
    []
  );

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

  useEffect(() => {
    if (autoExpandKey) {
      setExpanded(true);

      /*
       * Slightly longer delay: the screen may still be animating in.
       */
      const timeout = setTimeout(() => inputRef.current?.focus(), 350);

      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [autoExpandKey]);

  const resetForm = () => {
    setContent("");
    setIsAnonymous(false);
    setImage(null);
    setContentWarnings([]);
    setShowWarningPicker(false);
    setExpanded(false);
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Photo permission required",
        "Please allow photo access so you can add a photo to your post."
      );

      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    const asset = result.assets[0];

    if (!asset.uri) {
      Alert.alert("Unable to use photo", "Please choose another image.");
      return;
    }

    if (asset.fileSize && asset.fileSize > MAX_IMAGE_SIZE) {
      Alert.alert("Photo too large", "Please choose an image under 5 MB.");
      return;
    }

    if (asset.mimeType && !ALLOWED_IMAGE_TYPES.has(asset.mimeType)) {
      Alert.alert(
        "Unsupported photo",
        "Please choose a JPEG, PNG, or WebP image."
      );
      return;
    }

    setImage({
      uri: asset.uri,
      fileName: asset.fileName ?? getDefaultImageFileName(asset.mimeType),
      mimeType: asset.mimeType ?? "image/jpeg",
    });
  };

  const toggleContentWarning = (warning: ContentWarning) => {
    setContentWarnings((previous) =>
      previous.includes(warning)
        ? previous.filter((item) => item !== warning)
        : [...previous, warning]
    );
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    const created = await onSubmit(
      {
        content: content.trim(),
        isAnonymous,
        contentWarnings,
        image,
      },
      selectedGroupId
    );

    if (created) {
      resetForm();
    }
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

          {/* PHOTO */}

          {image && (
            <View style={styles.imagePreviewWrapper}>
              <Image
                source={{ uri: image.uri }}
                style={styles.imagePreview}
                contentFit="cover"
              />

              {!submitting && (
                <Pressable
                  hitSlop={8}
                  onPress={() => setImage(null)}
                  accessibilityLabel="Remove photo"
                  style={styles.imageRemoveButton}
                >
                  <Ionicons name="close" size={16} color="#ffffff" />
                </Pressable>
              )}
            </View>
          )}

          <View style={styles.optionsRow}>
            <Pressable
              disabled={submitting}
              style={styles.warningToggle}
              onPress={() => void handlePickImage()}
            >
              <Ionicons
                name={image ? "image" : "image-outline"}
                size={16}
                color={image ? "#4f46e5" : "#64748b"}
              />

              <Text
                style={[
                  styles.warningToggleText,
                  image && styles.photoToggleTextActive,
                ]}
              >
                {image ? "Change photo" : "Add photo"}
              </Text>
            </Pressable>

            {/* CONTENT WARNINGS */}

            <Pressable
              style={styles.warningToggle}
              onPress={() => setShowWarningPicker((previous) => !previous)}
            >
              <Ionicons
                name={
                  contentWarnings.length > 0 ? "warning" : "warning-outline"
                }
                size={16}
                color={contentWarnings.length > 0 ? "#b45309" : "#64748b"}
              />

              <Text
                style={[
                  styles.warningToggleText,
                  contentWarnings.length > 0 &&
                    styles.warningToggleTextActive,
                ]}
              >
                {contentWarnings.length > 0
                  ? `Content warning (${contentWarnings.length})`
                  : "Add content warning"}
              </Text>

              <Ionicons
                name={showWarningPicker ? "chevron-up" : "chevron-down"}
                size={14}
                color="#94a3b8"
              />
            </Pressable>
          </View>

          {showWarningPicker && (
            <View style={styles.warningPicker}>
              <Text style={styles.warningHint}>
                Members will see a warning and choose whether to view your
                post.
              </Text>

              <View style={styles.warningChipRow}>
                {CONTENT_WARNING_OPTIONS.map((warning) => {
                  const active = contentWarnings.includes(warning);

                  return (
                    <Pressable
                      key={warning}
                      onPress={() => toggleContentWarning(warning)}
                      style={[
                        styles.warningChip,
                        active && styles.warningChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.warningChipText,
                          active && styles.warningChipTextActive,
                        ]}
                      >
                        {CONTENT_WARNING_LABELS[warning]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
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
                onPress={resetForm}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                disabled={!canSubmit}
                onPress={() => void handleSubmit()}
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

  imagePreviewWrapper: {
    marginTop: 14,
    overflow: "hidden",
    borderRadius: 16,
  },

  imagePreview: {
    width: "100%",
    height: 190,
    backgroundColor: "#f1f5f9",
  },

  imageRemoveButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
  },

  optionsRow: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 18,
  },

  warningToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  photoToggleTextActive: {
    color: "#4f46e5",
  },

  warningToggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },

  warningToggleTextActive: {
    color: "#b45309",
  },

  warningPicker: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#fffbeb",
  },

  warningHint: {
    marginBottom: 10,
    fontSize: 11,
    lineHeight: 16,
    color: "#92400e",
  },

  warningChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  warningChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#fde68a",
    backgroundColor: "#ffffff",
  },

  warningChipActive: {
    borderColor: "#d97706",
    backgroundColor: "#fef3c7",
  },

  warningChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#92400e",
  },

  warningChipTextActive: {
    fontWeight: "800",
    color: "#b45309",
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
