import type { UserRole } from "@/features/auth/types/auth.types";

export interface PostAuthorSummary {
  id: string | null;
  fullName: string;
  role: UserRole | null;
  avatarUrl: string | null;
  isAnonymized: boolean;
}

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

export interface Post {
  id: string;

  group: string;
  content: string;

  imageUrl: string | null;
  isAnonymous: boolean;
  isPinned: boolean;

  author: PostAuthorSummary;

  likeCount: number;
  commentCount: number;
  likedByMe: boolean;

  crisisFlag?: CrisisFlag | null;

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

export interface CommentsResponseData {
  comments: PostComment[];
  totalComments: number;
}

export interface CreatePostPayload {
  content: string;
  isAnonymous?: boolean;
}

export interface CreatePostResponseData {
  post: Post;

  safety?: {
    crisisDetected: boolean;
  };
}

export type CrisisAlertStatus = "open" | "handled" | "all";

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
