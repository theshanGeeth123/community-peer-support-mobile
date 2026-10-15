import { useThemeTone, useThemedStyles } from '@/theme/useAlyvenAppearance';
import { useCallback, useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  AppState,
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

import {
  postDraftStorage,
  type PostDraft,
} from "@/storage/postDraft.storage";

import type {
  ContentWarning,
  CreatePostPayload,
  PostImageFile,
} from "../types/post.types";

const MAX_CONTENT_LENGTH = 3000;

/*
 * How long after the last change the draft is written to the phone.
 */
const DRAFT_SAVE_DELAY_MS = 1000;

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
  draftKey,
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

  /*
   * When set, the text and options are auto-saved on this phone under
   * this key and restored next time (see postDraft.storage.ts).
   * Photos are not saved.
   */
  draftKey?: string;
}) {
  const themeStyles = useThemedStyles(styles);
  const themeTone = useThemeTone();

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

  /*
  |--------------------------------------------------------------------------
  | AUTO-SAVED DRAFT
  |--------------------------------------------------------------------------
  |
  | The text and options are saved on this phone about a second after
  | typing stops, and restored the next time the composer is shown.
  |
  | draftReadyRef  → false until the stored draft has been read, so an
  |                  empty composer can never overwrite a saved draft
  | unsavedDraftRef → the latest changes not yet written; flushed when
  |                  the composer goes away or the app is backgrounded
  |
  */

  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  const draftReadyRef = useRef(false);
  const contentRef = useRef(content);
  contentRef.current = content;

  const groupOptionsRef = useRef(groupOptions);
  groupOptionsRef.current = groupOptions;

  const unsavedDraftRef = useRef<{
    draftKey: string;
    draft: Omit<PostDraft, "savedAt">;
  } | null>(null);

  const flushDraft = useCallback(() => {
    const unsaved = unsavedDraftRef.current;

    if (!unsaved) {
      return;
    }

    unsavedDraftRef.current = null;

    if (unsaved.draft.content.trim().length > 0) {
      void postDraftStorage.saveDraft(unsaved.draftKey, unsaved.draft);
    } else {
      void postDraftStorage.removeDraft(unsaved.draftKey);
    }
  }, []);

  /*
   * Load the stored draft. Runs again if the composer is reused for
   * another group (draftKey changes).
   */
  useEffect(() => {
    draftReadyRef.current = false;
    setHasRestoredDraft(false);

    if (!draftKey) {
      return undefined;
    }

    let cancelled = false;

    postDraftStorage.getDraft(draftKey).then((draft) => {
      if (cancelled) {
        return;
      }

      /*
       * Only restore into an empty composer — never over text the
       * member has already started typing.
       */
      if (draft && contentRef.current.length === 0) {
        setContent(draft.content);
        setIsAnonymous(draft.isAnonymous);
        setContentWarnings(draft.contentWarnings);

        if (
          draft.selectedGroupId &&
          groupOptionsRef.current?.some(
            (option) => option.id === draft.selectedGroupId
          )
        ) {
          setSelectedGroupId(draft.selectedGroupId);
        }

        setHasRestoredDraft(true);
      }

      draftReadyRef.current = true;
    });

    return () => {
      cancelled = true;

      /*
       * Leaving this draft (screen closed, or switched to another
       * group): write anything not saved yet, then start clean.
       */
      flushDraft();

      setContent("");
      setIsAnonymous(false);
      setContentWarnings([]);
      setImage(null);
    };
  }, [draftKey, flushDraft]);

  /*
   * Save about a second after the last change.
   */
  useEffect(() => {
    if (!draftKey || !draftReadyRef.current) {
      return undefined;
    }

    unsavedDraftRef.current = {
      draftKey,
      draft: { content, isAnonymous, contentWarnings, selectedGroupId },
    };

    const timeout = setTimeout(flushDraft, DRAFT_SAVE_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [
    draftKey,
    content,
    isAnonymous,
    contentWarnings,
    selectedGroupId,
    flushDraft,
  ]);

  /*
   * App sent to the background (or about to be closed): save now.
   */
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        flushDraft();
      }
    });

    return () => subscription.remove();
  }, [flushDraft]);

  const discardDraft = () => {
    unsavedDraftRef.current = null;

    if (draftKey) {
      void postDraftStorage.removeDraft(draftKey);
    }

    setHasRestoredDraft(false);
  };

  const resetForm = () => {
    setContent("");
    setIsAnonymous(false);
    setImage(null);
    setContentWarnings([]);
    setShowWarningPicker(false);
    setExpanded(false);
  };

  /*
   * Cancel with text in the box: ask, because the text is a saved
   * draft and silently deleting it would defeat the point.
   */
  const handleCancel = () => {
    if (content.trim().length === 0) {
      discardDraft();
      resetForm();
      return;
    }

    if (!draftKey) {
      resetForm();
      return;
    }

    Alert.alert("Keep this draft?", "You can come back and finish it later.", [
      {
        text: "Discard",
        style: "destructive",
        onPress: () => {
          discardDraft();
          resetForm();
        },
      },
      {
        text: "Keep draft",
        onPress: () => {
          flushDraft();
          setExpanded(false);
        },
      },
    ]);
  };

  const handleDiscardRestoredDraft = () => {
    Alert.alert("Discard draft?", "The saved text will be deleted.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Discard",
        style: "destructive",
        onPress: () => {
          discardDraft();
          resetForm();
        },
      },
    ]);
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
      /*
       * Posted: the draft has done its job.
       */
      discardDraft();
      resetForm();
    }
  };

  const selectedGroupName = groupOptions?.find(
    (option) => option.id === selectedGroupId
  )?.name;

  return (
    <View style={themeStyles.card}>
      <View style={themeStyles.topRow}>
        <View style={themeStyles.avatar}>
          <Text style={themeStyles.avatarText}>
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
            placeholderTextColor={themeTone("#8BA3AB", "placeholderTextColor")}
            style={themeStyles.input}
          />
        ) : (
          <Pressable style={themeStyles.trigger} onPress={handleExpand}>
            {content.trim().length > 0 ? (
              <Text numberOfLines={1} style={themeStyles.triggerDraftText}>
                Draft: {content.trim()}
              </Text>
            ) : (
              <Text style={themeStyles.triggerText}>What's on your mind?</Text>
            )}
          </Pressable>
        )}
      </View>

      {expanded && (
        <>
          {/* RESTORED DRAFT */}

          {hasRestoredDraft && (
            <View style={themeStyles.draftNote}>
              <Ionicons name="document-text-outline" size={14} color={themeTone("#0E7C86", "color")} />

              <Text style={themeStyles.draftNoteText}>
                Draft restored — saved on this phone only
              </Text>

              <Pressable
                hitSlop={8}
                disabled={submitting}
                onPress={handleDiscardRestoredDraft}
              >
                <Text style={themeStyles.draftDiscardText}>Discard</Text>
              </Pressable>
            </View>
          )}

          {groupOptions && groupOptions.length > 1 && (
            <View style={themeStyles.groupPickerSection}>
              <Text style={themeStyles.groupPickerLabel}>Posting to</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={themeStyles.groupChipRow}
              >
                {groupOptions.map((option) => {
                  const active = option.id === selectedGroupId;

                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => setSelectedGroupId(option.id)}
                      style={[
                        themeStyles.groupChip,
                        active && themeStyles.groupChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          themeStyles.groupChipText,
                          active && themeStyles.groupChipTextActive,
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
            <View style={themeStyles.singleGroupBadge}>
              <Ionicons name="people-outline" size={13} color={themeTone("#0E7C86", "color")} />

              <Text style={themeStyles.singleGroupBadgeText}>
                {selectedGroupName}
              </Text>
            </View>
          )}

          {/* PHOTO */}

          {image && (
            <View style={themeStyles.imagePreviewWrapper}>
              <Image
                source={{ uri: image.uri }}
                style={themeStyles.imagePreview}
                contentFit="cover"
              />

              {!submitting && (
                <Pressable
                  hitSlop={8}
                  onPress={() => setImage(null)}
                  accessibilityLabel="Remove photo"
                  style={themeStyles.imageRemoveButton}
                >
                  <Ionicons name="close" size={16} color={themeTone("#ffffff", "color")} />
                </Pressable>
              )}
            </View>
          )}

          <View style={themeStyles.optionsRow}>
            <Pressable
              disabled={submitting}
              style={themeStyles.warningToggle}
              onPress={() => void handlePickImage()}
            >
              <Ionicons
                name={image ? "image" : "image-outline"}
                size={16}
                color={image ? "#0E7C86" : "#64808C"}
              />

              <Text
                style={[
                  themeStyles.warningToggleText,
                  image && themeStyles.photoToggleTextActive,
                ]}
              >
                {image ? "Change photo" : "Add photo"}
              </Text>
            </Pressable>

            {/* CONTENT WARNINGS */}

            <Pressable
              style={themeStyles.warningToggle}
              onPress={() => setShowWarningPicker((previous) => !previous)}
            >
              <Ionicons
                name={
                  contentWarnings.length > 0 ? "warning" : "warning-outline"
                }
                size={16}
                color={contentWarnings.length > 0 ? "#b45309" : "#64808C"}
              />

              <Text
                style={[
                  themeStyles.warningToggleText,
                  contentWarnings.length > 0 &&
                    themeStyles.warningToggleTextActive,
                ]}
              >
                {contentWarnings.length > 0
                  ? `Content warning (${contentWarnings.length})`
                  : "Add content warning"}
              </Text>

              <Ionicons
                name={showWarningPicker ? "chevron-up" : "chevron-down"}
                size={14}
                color={themeTone("#8BA3AB", "color")}
              />
            </Pressable>
          </View>

          {showWarningPicker && (
            <View style={themeStyles.warningPicker}>
              <Text style={themeStyles.warningHint}>
                Members will see a warning and choose whether to view your
                post.
              </Text>

              <View style={themeStyles.warningChipRow}>
                {CONTENT_WARNING_OPTIONS.map((warning) => {
                  const active = contentWarnings.includes(warning);

                  return (
                    <Pressable
                      key={warning}
                      onPress={() => toggleContentWarning(warning)}
                      style={[
                        themeStyles.warningChip,
                        active && themeStyles.warningChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          themeStyles.warningChipText,
                          active && themeStyles.warningChipTextActive,
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

          <View style={themeStyles.footer}>
            <Pressable
              style={themeStyles.anonymousToggle}
              onPress={() => setIsAnonymous((previous) => !previous)}
            >
              <Ionicons
                name={isAnonymous ? "checkbox" : "square-outline"}
                size={19}
                color={themeTone("#0E7C86", "color")}
              />

              <Text style={themeStyles.anonymousLabel}>Post anonymously</Text>
            </Pressable>

            <View style={themeStyles.footerButtons}>
              <Pressable
                disabled={submitting}
                onPress={handleCancel}
                style={themeStyles.cancelButton}
              >
                <Text style={themeStyles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                disabled={!canSubmit}
                onPress={() => void handleSubmit()}
                style={[
                  themeStyles.submitButton,
                  !canSubmit && themeStyles.submitDisabled,
                ]}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={themeTone("#ffffff", "color")} />
                ) : (
                  <>
                    <Ionicons name="send-outline" size={15} color={themeTone("#ffffff", "color")} />

                    <Text style={themeStyles.submitButtonText}>Post</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>

          {isAnonymous && (
            <Text style={themeStyles.anonymousCaption}>
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
    borderColor: "#E0EDEB",
    borderRadius: 20,
    backgroundColor: "#ffffff",

    shadowColor: "#0E2A47",
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
    backgroundColor: "#EAF8F5",
  },

  avatarText: {
    fontWeight: "800",
    color: "#0E7C86",
  },

  trigger: {
    flex: 1,
    marginLeft: 12,
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 21,
    backgroundColor: "#F5FAF9",
  },

  triggerText: {
    fontSize: 14,
    color: "#8BA3AB",
  },

  triggerDraftText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0E7C86",
  },

  draftNote: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#EAF8F5",
  },

  draftNoteText: {
    flex: 1,
    marginHorizontal: 7,
    fontSize: 12,
    fontWeight: "600",
    color: "#09646E",
  },

  draftDiscardText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#be123c",
  },

  input: {
    flex: 1,
    marginLeft: 12,
    minHeight: 64,
    fontSize: 15,
    lineHeight: 21,
    color: "#0E2A47",
  },

  groupPickerSection: {
    marginTop: 14,
  },

  groupPickerLabel: {
    marginBottom: 7,
    fontSize: 11,
    fontWeight: "700",
    color: "#8BA3AB",
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
    borderColor: "#E0EDEB",
    backgroundColor: "#F5FAF9",
  },

  groupChipActive: {
    borderColor: "#0E7C86",
    backgroundColor: "#EAF8F5",
  },

  groupChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64808C",
  },

  groupChipTextActive: {
    color: "#0E7C86",
  },

  singleGroupBadge: {
    marginTop: 12,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#EAF8F5",
  },

  singleGroupBadgeText: {
    marginLeft: 5,
    fontSize: 11,
    fontWeight: "700",
    color: "#0E7C86",
  },

  imagePreviewWrapper: {
    marginTop: 14,
    overflow: "hidden",
    borderRadius: 16,
  },

  imagePreview: {
    width: "100%",
    height: 190,
    backgroundColor: "#EDF5F4",
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
    color: "#0E7C86",
  },

  warningToggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64808C",
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
    borderTopColor: "#EDF5F4",
  },

  anonymousToggle: {
    flexDirection: "row",
    alignItems: "center",
  },

  anonymousLabel: {
    marginLeft: 7,
    fontSize: 13,
    fontWeight: "600",
    color: "#31515F",
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
    color: "#8BA3AB",
  },

  submitButton: {
    marginLeft: 6,
    height: 38,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: "#0E7C86",
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
    color: "#8BA3AB",
  },
});
