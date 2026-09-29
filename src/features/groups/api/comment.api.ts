import apiClient from "@/services/api/apiClient";

import type { ApiResponse } from "@/features/auth/types/auth.types";

import type {
  Comment,
  CreateCommentPayload,
  UpdateCommentPayload,
  CommentReactionResponse,
} from "../types/comment.types";

/*
|--------------------------------------------------------------------------
| COMMENT REACTION TYPES
|--------------------------------------------------------------------------
*/

export type CommentReactionType =
  | "like"
  | "love"
  | "haha"
  | "wow"
  | "sad"
  | "angry";

/*
|--------------------------------------------------------------------------
| COMMENT REACTION DATA
|--------------------------------------------------------------------------
*/

export interface CommentReactionData {
  reaction: CommentReactionType | null;

  myReaction: CommentReactionType | null;

  reactionCounts: {
    like: number;
    love: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
  };
}

/*
|--------------------------------------------------------------------------
| COMMENT MEDIA
|--------------------------------------------------------------------------
|
| Media selected from the React Native device.
|
*/

export interface CommentMediaFile {
  uri: string;
  name?: string;
  type?: string;
}

/*
|--------------------------------------------------------------------------
| CREATE COMMENT FORM DATA
|--------------------------------------------------------------------------
|
| Converts the comment payload + selected media into
| multipart/form-data for the backend.
|
*/

const createCommentFormData = (
  payload: CreateCommentPayload,
  media: CommentMediaFile[]
): FormData => {
  const formData = new FormData();

  /*
  |--------------------------------------------------------------------------
  | COMMENT TEXT
  |--------------------------------------------------------------------------
  */

  formData.append(
    "content",
    payload.content
  );

  /*
  |--------------------------------------------------------------------------
  | PHOTOS / VIDEOS
  |--------------------------------------------------------------------------
  |
  | Backend expects:
  |
  | media
  |
  | Multiple files can use the same field name.
  |
  */

  media.forEach((file, index) => {
    formData.append(
      "media",
      {
        uri: file.uri,

        name:
          file.name ??
          `comment-media-${Date.now()}-${index}`,

        type:
          file.type ??
          "application/octet-stream",
      } as any
    );
  });

  return formData;
};

/*
|--------------------------------------------------------------------------
| COMMENT API
|--------------------------------------------------------------------------
*/

export const commentApi = {
  /*
  |--------------------------------------------------------------------------
  | CREATE COMMENT
  |--------------------------------------------------------------------------
  */

  async createComment(
    postId: string,
    payload: CreateCommentPayload,
    media: CommentMediaFile[] = []
  ): Promise<ApiResponse<{ comment: Comment }>> {
    /*
    |--------------------------------------------------------------------------
    | TEXT-ONLY COMMENT
    |--------------------------------------------------------------------------
    |
    | Keep the existing JSON request when there is
    | no media.
    |
    | This preserves the existing text-only behaviour.
    |
    */

    if (!media.length) {
      const response =
        await apiClient.post<
          ApiResponse<{ comment: Comment }>
        >(
          `/posts/${postId}/comments`,
          payload
        );

      return response.data;
    }

    /*
    |--------------------------------------------------------------------------
    | COMMENT WITH MEDIA
    |--------------------------------------------------------------------------
    |
    | Send FormData when photos/videos are selected.
    |
    | IMPORTANT:
    | Do NOT manually set Content-Type here.
    | Axios/React Native will generate the correct
    | multipart boundary automatically.
    |
    */

    const formData =
      createCommentFormData(
        payload,
        media
      );

    const response =
      await apiClient.post<
        ApiResponse<{ comment: Comment }>
      >(
        `/posts/${postId}/comments`,
        formData
      );

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
    const response =
      await apiClient.patch<
        ApiResponse<{ comment: Comment }>
      >(
        `/comments/${commentId}`,
        payload
      );

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
    const response =
      await apiClient.delete<
        ApiResponse<null>
      >(
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
    payload: CreateCommentPayload,
    media: CommentMediaFile[] = []
  ): Promise<ApiResponse<{ reply: Comment }>> {
    /*
    |--------------------------------------------------------------------------
    | TEXT-ONLY REPLY
    |--------------------------------------------------------------------------
    |
    | Keep the existing JSON request when there is
    | no media.
    |
    */

    if (!media.length) {
      const response =
        await apiClient.post<
          ApiResponse<{ reply: Comment }>
        >(
          `/comments/${commentId}/replies`,
          payload
        );

      return response.data;
    }

    /*
    |--------------------------------------------------------------------------
    | REPLY WITH MEDIA
    |--------------------------------------------------------------------------
    |
    | Send FormData when photos/videos are selected.
    |
    | IMPORTANT:
    | Do NOT manually set Content-Type here.
    |
    */

    const formData =
      createCommentFormData(
        payload,
        media
      );

    const response =
      await apiClient.post<
        ApiResponse<{ reply: Comment }>
      >(
        `/comments/${commentId}/replies`,
        formData
      );

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | TOGGLE COMMENT HEART
  |--------------------------------------------------------------------------
  |
  | Existing logic is kept unchanged.
  |
  */

  async toggleHeart(
    commentId: string
  ): Promise<ApiResponse<CommentReactionResponse>> {
    const response =
      await apiClient.post<
        ApiResponse<CommentReactionResponse>
      >(
        `/comments/${commentId}/heart`
      );

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | TOGGLE COMMENT / REPLY REACTION
  |--------------------------------------------------------------------------
  |
  | Supported reactions:
  |
  | like
  | love
  | haha
  | wow
  | sad
  | angry
  |
  | The same endpoint works for both comments
  | and replies because both are stored as
  | PostComment documents in the backend.
  |
  */

  async toggleReaction(
    commentId: string,
    reactionType: CommentReactionType
  ): Promise<ApiResponse<CommentReactionData>> {
    const response =
      await apiClient.post<
        ApiResponse<CommentReactionData>
      >(
        `/comments/${commentId}/reaction`,
        {
          reactionType,
        }
      );

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | TOGGLE COMMENT PIN
  |--------------------------------------------------------------------------
  |
  | Pins or unpins the user's own comment.
  |
  | The backend checks whether the current user
  | is the author of the comment.
  |
  */

  async toggleCommentPin(
    commentId: string
  ): Promise<ApiResponse<{ isPinned: boolean }>> {
    const response =
      await apiClient.patch<
        ApiResponse<{ isPinned: boolean }>
      >(
        `/comments/${commentId}/pin`
      );

    return response.data;
  },
};