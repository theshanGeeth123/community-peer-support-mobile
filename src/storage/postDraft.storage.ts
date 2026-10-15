import AsyncStorage from "@react-native-async-storage/async-storage";

import type { ContentWarning } from "@/features/groups/types/post.types";

const POST_DRAFT_KEY_PREFIX = "community_peer_support_post_draft:";

/*
 * An unsent post, kept on this phone only. Photos are not saved —
 * only the text and the chosen options.
 */
export interface PostDraft {
  content: string;
  isAnonymous: boolean;
  contentWarnings: ContentWarning[];

  /*
   * Group picked in the composer (only where a group picker is shown).
   */
  selectedGroupId?: string;

  savedAt: string;
}

/*
 * One draft per user and per place the composer is shown, so drafts
 * never mix between accounts or between groups.
 */
export function buildPostDraftKey(userId: string, scope: string) {
  return `${userId}:${scope}`;
}

const storageKey = (draftKey: string) =>
  `${POST_DRAFT_KEY_PREFIX}${draftKey}`;

function isPostDraft(value: unknown): value is PostDraft {
  if (!value || typeof value !== "object") {
    return false;
  }

  const draft = value as Record<string, unknown>;

  return (
    typeof draft.content === "string" &&
    typeof draft.isAnonymous === "boolean" &&
    Array.isArray(draft.contentWarnings)
  );
}

/*
 * Storage problems are never allowed to break posting, so every
 * function here swallows its errors.
 */
export const postDraftStorage = {
  async getDraft(draftKey: string): Promise<PostDraft | null> {
    try {
      const raw = await AsyncStorage.getItem(storageKey(draftKey));

      if (!raw) {
        return null;
      }

      const parsed: unknown = JSON.parse(raw);

      return isPostDraft(parsed) && parsed.content.trim().length > 0
        ? parsed
        : null;
    } catch (error) {
      console.warn("Failed to read post draft:", error);

      return null;
    }
  },

  async saveDraft(
    draftKey: string,
    draft: Omit<PostDraft, "savedAt">
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        storageKey(draftKey),
        JSON.stringify({
          ...draft,
          savedAt: new Date().toISOString(),
        } satisfies PostDraft)
      );
    } catch (error) {
      console.warn("Failed to save post draft:", error);
    }
  },

  async removeDraft(draftKey: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(storageKey(draftKey));
    } catch (error) {
      console.warn("Failed to remove post draft:", error);
    }
  },
};
