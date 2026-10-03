import { useSyncExternalStore } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import type { TranslationLanguage } from "@/features/groups/types/post.types";

import {
  getLanguageFromLocale,
  isTranslationLanguage,
} from "./languageRules";

/*
|--------------------------------------------------------------------------
| MY LANGUAGE
|--------------------------------------------------------------------------
|
| The language this person reads in. Posts written in another language
| get a "Translate" button into this one.
|
| - Starts from the phone's language setting.
| - Can be changed with the language button; the choice is saved on
|   this phone.
| - Shared by every screen: changing it updates all open posts at once.
|
*/

const MY_LANGUAGE_KEY = "community_peer_support_my_language";

function getDeviceLocale(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale ?? null;
  } catch {
    return null;
  }
}

let currentLanguage: TranslationLanguage = getLanguageFromLocale(
  getDeviceLocale()
);

let hasLoadedSavedChoice = false;

const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

/*
 * Reads the saved choice once, the first time anything asks for the
 * language. Until it arrives the phone's language is used.
 */
function loadSavedChoice() {
  if (hasLoadedSavedChoice) {
    return;
  }

  hasLoadedSavedChoice = true;

  AsyncStorage.getItem(MY_LANGUAGE_KEY)
    .then((saved) => {
      if (isTranslationLanguage(saved) && saved !== currentLanguage) {
        currentLanguage = saved;
        notify();
      }
    })
    .catch(() => {
      /*
       * Keep the phone's language.
       */
    });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  loadSavedChoice();

  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => currentLanguage;

export function setMyLanguage(language: TranslationLanguage) {
  if (language === currentLanguage) {
    return;
  }

  currentLanguage = language;
  notify();

  AsyncStorage.setItem(MY_LANGUAGE_KEY, language).catch(() => {
    /*
     * Still applies for this session.
     */
  });
}

/**
 * The reader's language. Re-renders the component when it changes.
 */
export function useMyLanguage(): TranslationLanguage {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
