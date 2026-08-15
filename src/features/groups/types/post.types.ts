import type { UserRole } from "@/features/auth/types/auth.types";

export interface PostAuthorSummary {
  id: string | null;
  fullName: string;
  role: UserRole | null;
  avatarUrl: string | null;
  isAnonymized: boolean;
}

export interface Post {
  id: string;

  group: string;
  content: string;

  imageUrl: string | null;
  isAnonymous: boolean;

  author: PostAuthorSummary;

  likeCount: number;
  commentCount: number;
  likedByMe: boolean;

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

export interface CreateCommentPayload {
  content: string;
}

export interface ToggleLikeResponseData {
  liked: boolean;
  likeCount: number;
}
