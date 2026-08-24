import apiClient from "@/services/api/apiClient";

import type { ApiResponse } from "@/features/auth/types/auth.types";

import type {
  Comment,
  CreateCommentPayload,
  UpdateCommentPayload,
  CommentReactionResponse,
} from "../types/comment.types";

export const commentApi = {
  /*
  |--------------------------------------------------------------------------
  | CREATE COMMENT
  |--------------------------------------------------------------------------
  */

  async createComment(
    postId: string,
    payload: CreateCommentPayload
  ): Promise<ApiResponse<{ comment: Comment }>> {
    const response = await apiClient.post<
      ApiResponse<{ comment: Comment }>
    >(`/posts/${postId}/comments`, payload);

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | UPDATE COMMENT
  |--------------------------------------------------------------------------
  */

  async updateComment(
    commentId: string,
    payload: UpdateCommentPayload
  ): Promise<ApiResponse<{ comment: Comment }>> {
    const response = await apiClient.patch<
      ApiResponse<{ comment: Comment }>
    >(`/comments/${commentId}`, payload);

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | DELETE COMMENT
  |--------------------------------------------------------------------------
  */

  async deleteComment(
    commentId: string
  ): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/comments/${commentId}`
    );

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | CREATE REPLY
  |--------------------------------------------------------------------------
  */

  async createReply(
    commentId: string,
    payload: CreateCommentPayload
  ): Promise<ApiResponse<{ reply: Comment }>> {
    const response = await apiClient.post<
      ApiResponse<{ reply: Comment }>
    >(`/comments/${commentId}/replies`, payload);

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | TOGGLE COMMENT HEART
  |--------------------------------------------------------------------------
  */

  async toggleHeart(
    commentId: string
  ): Promise<ApiResponse<CommentReactionResponse>> {
    const response = await apiClient.post<
      ApiResponse<CommentReactionResponse>
    >(`/comments/${commentId}/heart`);

    return response.data;
  },
};