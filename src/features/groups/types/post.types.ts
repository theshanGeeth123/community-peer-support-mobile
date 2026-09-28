import type { UserRole } from "@/features/auth/types/auth.types";

/*
 * Set when the author is staff of the post's group (or an admin).
 * Never set on anonymous posts.
 */
export type StaffBadge = "PEER_SUPPORTER" | "MODERATOR" | "ADMIN";

export interface PostAuthorSummary {
  id: string | null;
  fullName: string;
  role: UserRole | null;
  avatarUrl: string | null;
  isAnonymized: boolean;
  staffBadge?: StaffBadge | null;
}

/*
 * Mirrors backend post.constants.js CONTENT_WARNING
 */
export type ContentWarning =
  | "SUICIDE_SELF_HARM"
  | "EATING_DISORDERS"
  | "ABUSE"
  | "GRIEF"
  | "SUBSTANCE_USE"
  | "VIOLENCE";

/*
 * Only returned to group staff. For everyone else it is null.
 */
export interface CrisisFlag {
  isFlagged: boolean;
  matchedTerms: string[];
  flaggedAt: string | null;

  isHandled: boolean;
  handledBy: string | null;
  handledAt: string | null;
}

/*
 * Post reaction types supported by the backend.
 */
export type PostReactionType =
  | "like"
  | "love"
  | "haha"
  | "wow"
  | "sad"
  | "angry";

/*
 * Number of each reaction on a post.
 */
export interface PostReactionCounts {
  like: number;
  love: number;
  haha: number;
  wow: number;
  sad: number;
  angry: number;
}

export interface Post {
  id: string;

  group: string;
  content: string;

  imageUrl: string | null;
  isAnonymous: boolean;
  isPinned: boolean;

  contentWarnings: ContentWarning[];

  author: PostAuthorSummary;

  likeCount: number;
  commentCount: number;
  likedByMe: boolean;

  /*
   * New reaction system.
   * myReaction is the reaction selected by the current user.
   */
  myReaction: PostReactionType | null;
  reactionCounts: PostReactionCounts;

  crisisFlag?: CrisisFlag | null;

  /*
   * True when a moderator removed the post through a report.
   * Only staff ever receive removed posts (opening one by ID);
   * removedAt / removalReason are included in that case.
   */
  isRemoved?: boolean;
  removedAt?: string | null;
  removalReason?: string | null;

  createdAt: string;
  updatedAt: string;

  groupName?: string | null;
}

export interface PostComment {
  id: string;

  post: string;
  group: string;
  content: string;

  author: PostAuthorSummary;

  createdAt: string;
  updatedAt: string;
}

export interface PostsPagination {
  page: number;
  limit: number;

  totalPosts: number;
  totalPages: number;

  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PostsResponseData {
  posts: Post[];
  pagination: PostsPagination;
}

export interface NeedsResponseData {
  crisisAlerts: Post[];
  unanswered: Post[];

  counts: {
    crisisAlerts: number;
    unanswered: number;
  };

  maxAgeDays: number;
  pagination: PostsPagination;
}

export interface CommentsResponseData {
  comments: PostComment[];
  totalComments: number;
}

export interface PostImageFile {
  uri: string;
  fileName: string;
  mimeType: string;
}

export interface CreatePostPayload {
  content: string;
  isAnonymous?: boolean;
  contentWarnings?: ContentWarning[];

  /*
   * Optional photo. When set, the post is sent as multipart/form-data.
   */
  image?: PostImageFile | null;
}

export interface CreatePostResponseData {
  post: Post;

  safety?: {
    crisisDetected: boolean;
  };
}

export type CrisisAlertStatus = "open" | "handled" | "all";

/*
 * Mirrors backend post.constants.js POST_SORT
 */
export type PostSort =
  | "newest"
  | "most_supported"
  | "most_discussed"
  | "unanswered";

export interface CreateCommentPayload {
  content: string;
}

export interface ToggleLikeResponseData {
  liked: boolean;
  likeCount: number;
}

export interface TogglePinResponseData {
  isPinned: boolean;
}