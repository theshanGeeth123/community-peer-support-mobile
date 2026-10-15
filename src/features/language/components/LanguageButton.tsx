import { useState } from "react";

import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { LANGUAGE_OPTIONS } from "../languageRules";
import { setMyLanguage, useMyLanguage } from "../myLanguage";

/*
 * Small header button showing the reader's language (EN / SI / TA).
 * Tapping it opens a picker. Posts written in another language then
 * offer a "Translate" button into the chosen one.
 */
export default function LanguageButton() {
  const myLanguage = useMyLanguage();

  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <>
      <Pressable
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Change my language"
        onPress={() => setPickerOpen(true)}
        style={styles.button}
      >
        <Ionicons name="language" size={16} color="#4f46e5" />

        <Text style={styles.buttonText}>{myLanguage}</Text>
      </Pressable>

      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setPickerOpen(false)}
        >
          {/*
           * Inner Pressable stops taps inside the card closing it.
           */}
          <Pressable style={styles.card} onPress={() => undefined}>
            <Text style={styles.title}>My language</Text>

            <Text style={styles.subtitle}>
              Posts written in another language will show a Translate
              button.
            </Text>

            {LANGUAGE_OPTIONS.map((option) => {
              const selected = option.code === myLanguage;

              return (
                <Pressable
                  key={option.code}
                  onPress={() => {
                    setMyLanguage(option.code);
                    setPickerOpen(false);
                  }}
                  style={[styles.option, selected && styles.optionSelected]}
                >
                  <View style={styles.optionText}>
                    <Text
                      style={[
                        styles.optionName,
                        selected && styles.optionNameSelected,
                      ]}
                    >
                      {option.nativeName}
                    </Text>

                    {option.nativeName !== option.englishName && (
                      <Text style={styles.optionEnglishName}>
                        {option.englishName}
                      </Text>
                    )}
                  </View>

                  {selected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={21}
                      color="#4f46e5"
                    />
                  )}
                </Pressable>
              );
            })}

            <Text style={styles.footnote}>
              Translations are made by AI and may not be perfect. You can
              always see the original.
            </Text>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 42,
    height: 42,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    borderRadius: 14,
    backgroundColor: "#eef2ff",
  },

  buttonText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#4f46e5",
  },

  overlay: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },

  card: {
    width: "100%",
    maxWidth: 380,
    padding: 20,
    borderRadius: 24,
    backgroundColor: "#ffffff",
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },

  subtitle: {
    marginTop: 5,
    marginBottom: 14,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748b",
  },

  option: {
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    backgroundColor: "#f8fafc",
  },

  optionSelected: {
    borderColor: "#4f46e5",
    backgroundColor: "#eef2ff",
  },

  optionText: {
    flex: 1,
  },

  optionName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },

  optionNameSelected: {
    color: "#4338ca",
  },

  optionEnglishName: {
    marginTop: 2,
    fontSize: 12,
    color: "#94a3b8",
  },

  footnote: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 16,
    color: "#94a3b8",
  },
});
