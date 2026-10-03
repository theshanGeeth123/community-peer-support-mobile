import apiClient from "@/services/api/apiClient";

import type { ApiResponse } from "@/features/auth/types/auth.types";

import type {
  CommentsResponseData,
  CreateCommentPayload,
  CreatePostPayload,
  CreatePostResponseData,
  CrisisAlertStatus,
  CrisisFlag,
  NeedsResponseData,
  Post,
  PostComment,
  PostSort,
  PostsResponseData,
  ToggleLikeResponseData,
  TogglePinResponseData,
  TranslatePostResponseData,
  TranslationLanguage,
} from "../types/post.types";

export const postApi = {
  async listMyFeed(
    filters: { page?: number; limit?: number } = {}
  ): Promise<ApiResponse<PostsResponseData>> {
    const response = await apiClient.get<ApiResponse<PostsResponseData>>(
      "/posts/my-feed",
      { params: filters }
    );

    return response.data;
  },

  async listPosts(
    groupId: string,
    filters: {
      page?: number;
      limit?: number;
      q?: string;
      sort?: PostSort;
    } = {}
  ): Promise<ApiResponse<PostsResponseData>> {
    const response = await apiClient.get<ApiResponse<PostsResponseData>>(
      `/groups/${groupId}/posts`,
      { params: filters }
    );

    return response.data;
  },

  async createPost(
    groupId: string,
    payload: CreatePostPayload
  ): Promise<ApiResponse<CreatePostResponseData>> {
    const { image, ...fields } = payload;

    if (!image) {
      const response = await apiClient.post<
        ApiResponse<CreatePostResponseData>
      >(`/groups/${groupId}/posts`, fields);

      return response.data;
    }

    /*
     * With a photo: multipart/form-data. Every field is text here,
     * so contentWarnings is sent as a JSON string.
     */
    const formData = new FormData();

    formData.append("content", fields.content);
    formData.append("isAnonymous", String(Boolean(fields.isAnonymous)));
    formData.append(
      "contentWarnings",
      JSON.stringify(fields.contentWarnings ?? [])
    );

    formData.append("image", {
      uri: image.uri,
      name: image.fileName,
      type: image.mimeType,
    } as unknown as Blob);

    const response = await apiClient.post<
      ApiResponse<CreatePostResponseData>
    >(`/groups/${groupId}/posts`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },

      timeout: 30000,
    });

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | CRISIS ALERTS (group staff)
  |--------------------------------------------------------------------------
  */

  async listCrisisAlerts(
    filters: {
      status?: CrisisAlertStatus;
      groupId?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<ApiResponse<PostsResponseData>> {
    const response = await apiClient.get<ApiResponse<PostsResponseData>>(
      "/posts/crisis-alerts",
      { params: filters }
    );

    return response.data;
  },

  async getNeedsResponseQueue(
    filters: { groupId?: string; page?: number; limit?: number } = {}
  ): Promise<ApiResponse<NeedsResponseData>> {
    const response = await apiClient.get<ApiResponse<NeedsResponseData>>(
      "/posts/needs-response",
      { params: filters }
    );

    return response.data;
  },

  async markCrisisHandled(
    postId: string
  ): Promise<ApiResponse<{ crisisFlag: CrisisFlag }>> {
    const response = await apiClient.patch<
      ApiResponse<{ crisisFlag: CrisisFlag }>
    >(`/posts/${postId}/crisis-flag/handle`);

    return response.data;
  },

  async getPost(postId: string): Promise<ApiResponse<{ post: Post }>> {
    const response = await apiClient.get<ApiResponse<{ post: Post }>>(
      `/posts/${postId}`
    );

    return response.data;
  },

  async deletePost(postId: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/posts/${postId}`
    );

    return response.data;
  },

  async toggleLike(
    postId: string
  ): Promise<ApiResponse<ToggleLikeResponseData>> {
    const response = await apiClient.post<
      ApiResponse<ToggleLikeResponseData>
    >(`/posts/${postId}/like`);

    return response.data;
  },

  async togglePin(
    postId: string
  ): Promise<ApiResponse<TogglePinResponseData>> {
    const response = await apiClient.post<ApiResponse<TogglePinResponseData>>(
      `/posts/${postId}/pin`
    );

    return response.data;
  },

  /*
   * AI translation. The first request for a language can take a few
   * seconds; after that the saved translation comes back instantly.
   */
  async translatePost(
    postId: string,
    language: TranslationLanguage
  ): Promise<ApiResponse<TranslatePostResponseData>> {
    const response = await apiClient.post<
      ApiResponse<TranslatePostResponseData>
    >(
      `/posts/${postId}/translate`,
      { language },
      { timeout: 30000 }
    );

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | COMMENTS
  |--------------------------------------------------------------------------
  */

  async listComments(
    postId: string
  ): Promise<ApiResponse<CommentsResponseData>> {
    const response = await apiClient.get<ApiResponse<CommentsResponseData>>(
      `/posts/${postId}/comments`
    );

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | CREATE COMMENT
  |--------------------------------------------------------------------------
  */

  async createComment(
    postId: string,
    payload: CreateCommentPayload
  ): Promise<ApiResponse<{ comment: PostComment }>> {
    const response = await apiClient.post<
      ApiResponse<{ comment: PostComment }>
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
    payload: CreateCommentPayload
  ): Promise<ApiResponse<{ comment: PostComment }>> {
    const response = await apiClient.patch<
      ApiResponse<{ comment: PostComment }>
    >(`/comments/${commentId}`, payload);

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | DELETE COMMENT
  |--------------------------------------------------------------------------
  */

  async deleteComment(commentId: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/comments/${commentId}`
    );

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | REPLY TO COMMENT
  |--------------------------------------------------------------------------
  */

  async createReply(
    commentId: string,
    payload: CreateCommentPayload
  ): Promise<ApiResponse<{ comment: PostComment }>> {
    const response = await apiClient.post<
      ApiResponse<{ comment: PostComment }>
    >(`/comments/${commentId}/replies`, payload);

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | HEART / UNHEART COMMENT
  |--------------------------------------------------------------------------
  */

  async toggleCommentHeart(
    commentId: string
  ): Promise<
    ApiResponse<{
      hearted: boolean;
      heartCount: number;
    }>
  > {
    const response = await apiClient.post<
      ApiResponse<{
        hearted: boolean;
        heartCount: number;
      }>
    >(`/comments/${commentId}/heart`);

    return response.data;
  },
};