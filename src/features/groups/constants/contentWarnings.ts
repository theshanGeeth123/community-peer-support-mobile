import type { ContentWarning } from "../types/post.types";

export const CONTENT_WARNING_LABELS: Record<ContentWarning, string> = {
  SUICIDE_SELF_HARM: "Suicide & self-harm",
  EATING_DISORDERS: "Eating disorders",
  ABUSE: "Abuse",
  GRIEF: "Grief & loss",
  SUBSTANCE_USE: "Substance use",
  VIOLENCE: "Violence",
};

export const CONTENT_WARNING_OPTIONS = Object.keys(
  CONTENT_WARNING_LABELS
) as ContentWarning[];

export function formatContentWarnings(warnings: ContentWarning[]) {
  return warnings
    .map((warning) => CONTENT_WARNING_LABELS[warning] ?? warning)
    .join(", ");
}
