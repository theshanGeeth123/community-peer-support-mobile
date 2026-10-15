import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  type TextStyle,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { postApi } from "@/features/groups/api/post.api";

import type {
  Post,
  TranslationLanguage,
} from "@/features/groups/types/post.types";

import {
  shouldOfferTranslation,
  TRANSLATION_TEXT,
} from "@/features/language/languageRules";
import { useMyLanguage } from "@/features/language/myLanguage";

import { getApiErrorMessage } from "@/services/api/apiError";

/*
 * A post's text, with a "Translate" button when the post is written
 * in a language other than the reader's.
 *
 * - The translation is fetched only when the reader taps the button.
 * - The original is never replaced: "Show original" is one tap away,
 *   and the text is always labelled as an AI translation.
 */
export default function TranslatablePostText({
  post,
  style,
}: {
  post: Pick<Post, "id" | "content" | "language">;
  style?: StyleProp<TextStyle>;
}) {
  const myLanguage = useMyLanguage();

  /*
   * The translation, remembered together with the language it is in,
   * so changing "My language" never shows text in the wrong language.
   */
  const [translation, setTranslation] = useState<{
    language: TranslationLanguage;
    content: string;
  } | null>(null);

  const [showingTranslation, setShowingTranslation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /*
   * A different post in this slot, or a new reader language:
   * start again from the original.
   */
  useEffect(() => {
    setShowingTranslation(false);
    setLoading(false);
    setError(null);
  }, [post.id, myLanguage]);

  const text = TRANSLATION_TEXT[myLanguage];

  const canTranslate = shouldOfferTranslation(post.language, myLanguage);

  const translationForMyLanguage =
    translation?.language === myLanguage ? translation.content : null;

  const isShowingTranslation =
    showingTranslation && translationForMyLanguage !== null;

  const handleTranslate = async () => {
    if (loading) {
      return;
    }

    if (translationForMyLanguage !== null) {
      setShowingTranslation(true);
      return;
    }

    const requestedLanguage = myLanguage;

    try {
      setLoading(true);
      setError(null);

      const response = await postApi.translatePost(
        post.id,
        requestedLanguage
      );

      setTranslation({
        language: requestedLanguage,
        content: response.data.translation.content,
      });

      setShowingTranslation(true);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text style={style}>
        {isShowingTranslation ? translationForMyLanguage : post.content}
      </Text>

      {canTranslate && (
        <View style={styles.row}>
          {isShowingTranslation ? (
            <>
              <Ionicons name="sparkles" size={12} color="#94a3b8" />

              <Text style={styles.translatedLabel}>
                {text.translatedByAi}
              </Text>

              <Text style={styles.separator}>·</Text>

              <Pressable
                hitSlop={8}
                onPress={() => setShowingTranslation(false)}
              >
                <Text style={styles.link}>{text.showOriginal}</Text>
              </Pressable>
            </>
          ) : loading ? (
            <>
              <ActivityIndicator size="small" color="#4f46e5" />

              <Text style={styles.translatedLabel}>{text.translating}</Text>
            </>
          ) : (
            <Pressable
              hitSlop={8}
              accessibilityRole="button"
              onPress={() => void handleTranslate()}
              style={styles.translateButton}
            >
              <Ionicons name="language" size={14} color="#4f46e5" />

              <Text style={styles.link}>
                {translationForMyLanguage !== null
                  ? text.showTranslation
                  : text.translate}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {canTranslate && error && !isShowingTranslation && (
        <Text style={styles.error}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 5,
  },

  translateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  link: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4f46e5",
  },

  translatedLabel: {
    fontSize: 12,
    color: "#94a3b8",
  },

  separator: {
    fontSize: 12,
    color: "#cbd5e1",
  },

  error: {
    marginTop: 5,
    fontSize: 12,
    color: "#b91c1c",
  },
});
