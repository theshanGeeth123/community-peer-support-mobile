import type { UserRole } from "@/features/auth/types/auth.types";

export interface GlobalPostAuthorSummary {
  id: string;
  fullName: string;
  role: UserRole;
  avatarUrl: string | null;
}

export type GlobalPostType = "post" | "announcement";

export interface GlobalPost {
  id: string;

  content: string;
  imageUrl: string | null;

  postType: GlobalPostType;
  isPinned: boolean;

  author: GlobalPostAuthorSummary;

  likeCount: number;
  commentCount: number;
  likedByMe: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface GlobalPostComment {
  id: string;

  post: string;
  content: string;

  author: GlobalPostAuthorSummary;

  createdAt: string;
  updatedAt: string;
}

export interface GlobalPostsPagination {
  page: number;
  limit: number;

  totalPosts: number;
  totalPages: number;

  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GlobalPostsResponseData {
  posts: GlobalPost[];
  pagination: GlobalPostsPagination;
}

export interface GlobalCommentsResponseData {
  comments: GlobalPostComment[];
  totalComments: number;
}

export interface CreateGlobalPostPayload {
  content: string;
  postType?: GlobalPostType;
  isPinned?: boolean;
}

export interface CreateGlobalPostCommentPayload {
  content: string;
}

export interface ToggleGlobalLikeResponseData {
  liked: boolean;
  likeCount: number;
}
