import { useThemeTone, useThemedStyles } from '@/theme/useAlyvenAppearance';
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
  const themeStyles = useThemedStyles(styles);
  const themeTone = useThemeTone();

  const myLanguage = useMyLanguage();

  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <>
      <Pressable
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Change my language"
        onPress={() => setPickerOpen(true)}
        style={themeStyles.button}
      >
        <Ionicons name="language" size={16} color={themeTone("#0E7C86", "color")} />

        <Text style={themeStyles.buttonText}>{myLanguage}</Text>
      </Pressable>

      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable
          style={themeStyles.overlay}
          onPress={() => setPickerOpen(false)}
        >
          {/*
           * Inner Pressable stops taps inside the card closing it.
           */}
          <Pressable style={themeStyles.card} onPress={() => undefined}>
            <Text style={themeStyles.title}>My language</Text>

            <Text style={themeStyles.subtitle}>
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
                  style={[themeStyles.option, selected && themeStyles.optionSelected]}
                >
                  <View style={themeStyles.optionText}>
                    <Text
                      style={[
                        themeStyles.optionName,
                        selected && themeStyles.optionNameSelected,
                      ]}
                    >
                      {option.nativeName}
                    </Text>

                    {option.nativeName !== option.englishName && (
                      <Text style={themeStyles.optionEnglishName}>
                        {option.englishName}
                      </Text>
                    )}
                  </View>

                  {selected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={21}
                      color={themeTone("#0E7C86", "color")}
                    />
                  )}
                </Pressable>
              );
            })}

            <Text style={themeStyles.footnote}>
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
    backgroundColor: "#EAF8F5",
  },

  buttonText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0E7C86",
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
    color: "#0E2A47",
  },

  subtitle: {
    marginTop: 5,
    marginBottom: 14,
    fontSize: 13,
    lineHeight: 19,
    color: "#64808C",
  },

  option: {
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0EDEB",
    borderRadius: 16,
    backgroundColor: "#F5FAF9",
  },

  optionSelected: {
    borderColor: "#0E7C86",
    backgroundColor: "#EAF8F5",
  },

  optionText: {
    flex: 1,
  },

  optionName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0E2A47",
  },

  optionNameSelected: {
    color: "#09646E",
  },

  optionEnglishName: {
    marginTop: 2,
    fontSize: 12,
    color: "#8BA3AB",
  },

  footnote: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 16,
    color: "#8BA3AB",
  },
});
