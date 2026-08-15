import apiClient from "@/services/api/apiClient";

import type { ApiResponse } from "@/features/auth/types/auth.types";

import type {
  CreateGlobalPostCommentPayload,
  CreateGlobalPostPayload,
  GlobalCommentsResponseData,
  GlobalPost,
  GlobalPostComment,
  GlobalPostsResponseData,
  ToggleGlobalLikeResponseData,
} from "../types/globalPost.types";

export const globalPostApi = {
  async listFeed(
    filters: { page?: number; limit?: number } = {}
  ): Promise<ApiResponse<GlobalPostsResponseData>> {
    const response = await apiClient.get<ApiResponse<GlobalPostsResponseData>>(
      "/community",
      { params: filters }
    );

    return response.data;
  },

  async createPost(
    payload: CreateGlobalPostPayload
  ): Promise<ApiResponse<{ post: GlobalPost }>> {
    const response = await apiClient.post<ApiResponse<{ post: GlobalPost }>>(
      "/community",
      payload
    );

    return response.data;
  },

  async getPost(postId: string): Promise<ApiResponse<{ post: GlobalPost }>> {
    const response = await apiClient.get<ApiResponse<{ post: GlobalPost }>>(
      `/community/${postId}`
    );

    return response.data;
  },

  async deletePost(postId: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/community/${postId}`
    );

    return response.data;
  },

  async toggleLike(
    postId: string
  ): Promise<ApiResponse<ToggleGlobalLikeResponseData>> {
    const response = await apiClient.post<
      ApiResponse<ToggleGlobalLikeResponseData>
    >(`/community/${postId}/like`);

    return response.data;
  },

  async listComments(
    postId: string
  ): Promise<ApiResponse<GlobalCommentsResponseData>> {
    const response = await apiClient.get<
      ApiResponse<GlobalCommentsResponseData>
    >(`/community/${postId}/comments`);

    return response.data;
  },

  async createComment(
    postId: string,
    payload: CreateGlobalPostCommentPayload
  ): Promise<ApiResponse<{ comment: GlobalPostComment }>> {
    const response = await apiClient.post<
      ApiResponse<{ comment: GlobalPostComment }>
    >(`/community/${postId}/comments`, payload);

    return response.data;
  },

  async deleteComment(commentId: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/community/comments/${commentId}`
    );

    return response.data;
  },
};
