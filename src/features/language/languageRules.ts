import type {
  PostLanguage,
  TranslationLanguage,
} from "@/features/groups/types/post.types";

/*
|--------------------------------------------------------------------------
| LANGUAGE RULES
|--------------------------------------------------------------------------
|
| Pure logic for "My language" and post translation. No React or
| storage here, so the rules are easy to test.
|
*/

export interface LanguageOption {
  code: TranslationLanguage;

  /*
   * The language's own name, shown in the picker.
   */
  nativeName: string;
  englishName: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "EN", nativeName: "English", englishName: "English" },
  { code: "SI", nativeName: "සිංහල", englishName: "Sinhala" },
  { code: "TA", nativeName: "தமிழ்", englishName: "Tamil" },
];

export const DEFAULT_LANGUAGE: TranslationLanguage = "EN";

export function isTranslationLanguage(
  value: unknown
): value is TranslationLanguage {
  return value === "EN" || value === "SI" || value === "TA";
}

/*
 * Picks the starting language from the phone's language setting,
 * e.g. "si-LK" → Sinhala, "ta-IN" → Tamil, anything else → English.
 */
export function getLanguageFromLocale(
  locale: string | null | undefined
): TranslationLanguage {
  const language = (locale ?? "").trim().toLowerCase().split(/[-_]/)[0];

  if (language === "si") {
    return "SI";
  }

  if (language === "ta") {
    return "TA";
  }

  return DEFAULT_LANGUAGE;
}

/*
 * Whether to show "Translate" under a post for a reader.
 *
 * - Same language → nothing to translate.
 * - SI_LATN is Sinhala typed in English letters ("mata godak dukai").
 *   English and Tamil readers get a translation; Sinhala readers can
 *   already read it, so they are not offered one.
 * - OTHER (only emoji, or unknown) → not offered.
 */
export function shouldOfferTranslation(
  postLanguage: PostLanguage | null | undefined,
  myLanguage: TranslationLanguage
): boolean {
  if (!postLanguage || postLanguage === "OTHER") {
    return false;
  }

  if (postLanguage === "SI_LATN") {
    return myLanguage !== "SI";
  }

  return postLanguage !== myLanguage;
}

/*
 * Shown in the reader's own language, so someone who reads only
 * Sinhala or Tamil can still find and use the button.
 */
export const TRANSLATION_TEXT: Record<
  TranslationLanguage,
  {
    translate: string;
    translating: string;
    translatedByAi: string;
    showOriginal: string;
    showTranslation: string;
  }
> = {
  EN: {
    translate: "Translate to English",
    translating: "Translating…",
    translatedByAi: "Translated by AI",
    showOriginal: "Show original",
    showTranslation: "Show translation",
  },

  SI: {
    translate: "සිංහලට පරිවර්තනය කරන්න",
    translating: "පරිවර්තනය වෙමින්…",
    translatedByAi: "AI මගින් පරිවර්තනය කරන ලදී",
    showOriginal: "මුල් පළ කිරීම පෙන්වන්න",
    showTranslation: "පරිවර්තනය පෙන්වන්න",
  },

  TA: {
    translate: "தமிழில் மொழிபெயர்க்கவும்",
    translating: "மொழிபெயர்க்கப்படுகிறது…",
    translatedByAi: "AI மூலம் மொழிபெயர்க்கப்பட்டது",
    showOriginal: "அசலைக் காட்டு",
    showTranslation: "மொழிபெயர்ப்பைக் காட்டு",
  },
};
