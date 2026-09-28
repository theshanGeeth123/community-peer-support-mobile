import { useEffect } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useSubmitReport } from "../hooks/useSubmitReport";
import type {
  ReportReason,
  ReportTargetType,
} from "../types/moderation.types";

// ── Types ──────────────────────────────────────────────────────────────────

interface SubmitReportSheetProps {
  visible: boolean;
  onClose: () => void;
  group: string;           // matches backend field name
  targetType: ReportTargetType;
  targetId: string;
}

// ── Schema ─────────────────────────────────────────────────────────────────

const REASONS: { value: ReportReason; label: string; description: string }[] = [
  {
    value: "HARMFUL_CONTENT",
    label: "Harmful Content",
    description: "Content that could cause real-world harm",
  },
  {
    value: "HATE_SPEECH",
    label: "Hate Speech",
    description: "Language targeting individuals or groups",
  },
  {
    value: "SPAM",
    label: "Spam",
    description: "Unsolicited or repetitive promotional material",
  },
  {
    value: "MISINFORMATION",
    label: "Misinformation",
    description: "False or misleading information",
  },
  {
    value: "OTHER",
    label: "Other",
    description: "A reason not covered above",
  },
];

const schema = z.object({
  reason: z.enum([
    "HARMFUL_CONTENT",
    "HATE_SPEECH",
    "SPAM",
    "MISINFORMATION",
    "OTHER",
  ]),
  additionalDetails: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

// ── Component ──────────────────────────────────────────────────────────────

export default function SubmitReportSheet({
  visible,
  onClose,
  group,
  targetType,
  targetId,
}: SubmitReportSheetProps) {
  const { submitting, error, success, submitReport, reset } =
    useSubmitReport();

  const {
    control,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      reason: undefined,
      additionalDetails: "",
    },
  });

  // When success, auto-close after a short delay
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => {
      handleClose();
    }, 1200);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success]);

  function handleClose() {
    resetForm();
    reset();
    onClose();
  }

  async function onSubmit(values: FormValues) {
    await submitReport({
      group,
      targetType,
      targetId,
      reason: values.reason,
      additionalDetails: values.additionalDetails || undefined,
    });
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={handleClose} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.kvContainer}
        pointerEvents="box-none"
      >
        <SafeAreaView
          edges={["bottom"]}
          style={styles.sheet}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Report {targetType === "POST" ? "Post" : "Comment"}</Text>
              <Text style={styles.subtitle}>
                Help us keep the community safe.
              </Text>
            </View>
            <Pressable
              onPress={handleClose}
              style={styles.closeBtn}
              hitSlop={12}
            >
              <Ionicons name="close" size={20} color="#64748b" />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Success state */}
            {success ? (
              <View style={styles.successBox}>
                <View style={styles.successIcon}>
                  <Ionicons
                    name="checkmark-circle"
                    size={40}
                    color="#10b981"
                  />
                </View>
                <Text style={styles.successTitle}>Report Submitted</Text>
                <Text style={styles.successSub}>
                  Thank you. Our moderators will review this shortly.
                </Text>
              </View>
            ) : (
              <>
                {/* Reason picker */}
                <Text style={styles.sectionLabel}>
                  What is the issue?
                </Text>

                <Controller
                  name="reason"
                  control={control}
                  render={({ field }) => (
                    <View style={styles.reasonGrid}>
                      {REASONS.map((r) => {
                        const selected = field.value === r.value;
                        return (
                          <Pressable
                            key={r.value}
                            onPress={() => field.onChange(r.value)}
                            style={[
                              styles.reasonChip,
                              selected && styles.reasonChipSelected,
                            ]}
                          >
                            <View style={styles.reasonChipInner}>
                              <View
                                style={[
                                  styles.radioOuter,
                                  selected && styles.radioOuterSelected,
                                ]}
                              >
                                {selected && (
                                  <View style={styles.radioInner} />
                                )}
                              </View>
                              <View style={styles.reasonTextWrap}>
                                <Text
                                  style={[
                                    styles.reasonLabel,
                                    selected && styles.reasonLabelSelected,
                                  ]}
                                >
                                  {r.label}
                                </Text>
                                <Text style={styles.reasonDesc}>
                                  {r.description}
                                </Text>
                              </View>
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                />

                {errors.reason ? (
                  <Text style={styles.fieldError}>
                    Please select a reason.
                  </Text>
                ) : null}

                {/* Additional details */}
                <Text style={[styles.sectionLabel, { marginTop: 20 }]}>
                  Additional details{" "}
                  <Text style={styles.optional}>(optional)</Text>
                </Text>

                <Controller
                  name="additionalDetails"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      style={styles.textArea}
                      placeholder="Provide any extra context that will help our moderators..."
                      placeholderTextColor="#94a3b8"
                      multiline
                      numberOfLines={4}
                      maxLength={500}
                      value={field.value}
                      onChangeText={field.onChange}
                      textAlignVertical="top"
                    />
                  )}
                />

                {/* API error */}
                {error ? (
                  <View style={styles.errorBox}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={16}
                      color="#dc2626"
                    />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                {/* Submit */}
                <Pressable
                  onPress={handleSubmit(onSubmit)}
                  disabled={submitting}
                  style={({ pressed }) => [
                    styles.submitBtn,
                    pressed && styles.submitBtnPressed,
                    submitting && styles.submitBtnDisabled,
                  ]}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Ionicons
                        name="flag"
                        size={16}
                        color="#fff"
                      />
                      <Text style={styles.submitLabel}>
                        Submit Report
                      </Text>
                    </>
                  )}
                </Pressable>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,23,42,0.5)",
  },
  kvContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "90%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e2e8f0",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 12,
  },
  optional: {
    fontWeight: "400",
    color: "#94a3b8",
  },
  reasonGrid: {
    gap: 8,
  },
  reasonChip: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    padding: 12,
  },
  reasonChipSelected: {
    borderColor: "#4f46e5",
    backgroundColor: "#eef2ff",
  },
  reasonChipInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  radioOuterSelected: {
    borderColor: "#4f46e5",
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4f46e5",
  },
  reasonTextWrap: {
    flex: 1,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  reasonLabelSelected: {
    color: "#4338ca",
  },
  reasonDesc: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 1,
  },
  fieldError: {
    fontSize: 12,
    color: "#dc2626",
    marginTop: 6,
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    color: "#0f172a",
    minHeight: 100,
    backgroundColor: "#f8fafc",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  errorText: {
    fontSize: 13,
    color: "#dc2626",
    flex: 1,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#e11d48",
    borderRadius: 16,
    paddingVertical: 15,
    marginTop: 20,
  },
  submitBtnPressed: {
    opacity: 0.85,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  successBox: {
    alignItems: "center",
    paddingVertical: 32,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#065f46",
    marginBottom: 8,
  },
  successSub: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
});
