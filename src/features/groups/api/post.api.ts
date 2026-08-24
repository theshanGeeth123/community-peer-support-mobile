import apiClient from "@/services/api/apiClient";

import type { ApiResponse } from "@/features/auth/types/auth.types";

import type {
  CommentsResponseData,
  CreateCommentPayload,
  CreatePostPayload,
  Post,
  PostComment,
  PostsResponseData,
  ToggleLikeResponseData,
  TogglePinResponseData,
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
    filters: { page?: number; limit?: number } = {}
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
  ): Promise<ApiResponse<{ post: Post }>> {
    const response = await apiClient.post<ApiResponse<{ post: Post }>>(
      `/groups/${groupId}/posts`,
      payload
    );

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