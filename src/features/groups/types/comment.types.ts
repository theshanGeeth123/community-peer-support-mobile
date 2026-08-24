import type { UserRole } from "@/features/auth/types/auth.types";

export interface CommentAuthor {
  id: string | null;
  fullName: string;
  role: UserRole | null;
  avatarUrl: string | null;
  isAnonymized: boolean;
}

export interface Comment {
  id: string;
  post: string;
  group: string;

  author: CommentAuthor;

  content: string;

  /**
   * null for a normal comment
   * contains the parent comment ID for a reply
   */
  parentComment: string | null;

  /**
   * Number of hearts/reactions on this comment
   */
  heartCount: number;

  /**
   * Whether the current logged-in user
   * has hearted this comment
   */
  heartedByMe: boolean;

  createdAt: string;
  updatedAt: string;

  /**
   * Replies belonging to this comment.
   * This can be populated on the frontend.
   */
  replies?: Comment[];
}

export interface CreateCommentPayload {
  content: string;
}

export interface UpdateCommentPayload {
  content: string;
}

export interface CommentReactionResponse {
  liked: boolean;
  heartCount: number;
}

export interface CommentsResponseData {
  comments: Comment[];
  totalComments: number;
}