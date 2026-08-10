import apiClient from "@/services/api/apiClient";

import type {
    ApiResponse,
} from "@/features/auth/types/auth.types";

import type {
    CreateGroupPayload,
    GroupFilters,
    GroupsResponseData,
    SupportGroup,
    UpdateGroupPayload,
} from "../types/group.types";

export const groupApi = {
  async getGroups(
    filters: GroupFilters = {}
  ): Promise<
    ApiResponse<GroupsResponseData>
  > {
    const response =
      await apiClient.get<
        ApiResponse<GroupsResponseData>
      >(
        "/groups",
        {
          params: filters,
        }
      );

    return response.data;
  },

  async getGroup(
    groupId: string
  ): Promise<
    ApiResponse<{
      group: SupportGroup;
    }>
  > {
    const response =
      await apiClient.get<
        ApiResponse<{
          group: SupportGroup;
        }>
      >(
        `/groups/${groupId}`
      );

    return response.data;
  },

  async createGroup(
    payload: CreateGroupPayload
  ): Promise<
    ApiResponse<{
      group: SupportGroup;
    }>
  > {
    const response =
      await apiClient.post<
        ApiResponse<{
          group: SupportGroup;
        }>
      >(
        "/groups",
        payload
      );

    return response.data;
  },

  async updateGroup(
    groupId: string,
    payload: UpdateGroupPayload
  ): Promise<
    ApiResponse<{
      group: SupportGroup;
    }>
  > {
    const response =
      await apiClient.patch<
        ApiResponse<{
          group: SupportGroup;
        }>
      >(
        `/groups/${groupId}`,
        payload
      );

    return response.data;
  },

  async assignPeerSupporter(
    groupId: string,
    userId: string
  ): Promise<
    ApiResponse<{
      group: SupportGroup;
    }>
  > {
    const response =
      await apiClient.post<
        ApiResponse<{
          group: SupportGroup;
        }>
      >(
        `/groups/${groupId}/peer-supporters/${userId}`
      );

    return response.data;
  },

  async removePeerSupporter(
    groupId: string,
    userId: string
  ): Promise<
    ApiResponse<{
      group: SupportGroup;
    }>
  > {
    const response =
      await apiClient.delete<
        ApiResponse<{
          group: SupportGroup;
        }>
      >(
        `/groups/${groupId}/peer-supporters/${userId}`
      );

    return response.data;
  },

  async assignModerator(
    groupId: string,
    userId: string
  ): Promise<
    ApiResponse<{
      group: SupportGroup;
    }>
  > {
    const response =
      await apiClient.post<
        ApiResponse<{
          group: SupportGroup;
        }>
      >(
        `/groups/${groupId}/moderators/${userId}`
      );

    return response.data;
  },

  async removeModerator(
    groupId: string,
    userId: string
  ): Promise<
    ApiResponse<{
      group: SupportGroup;
    }>
  > {
    const response =
      await apiClient.delete<
        ApiResponse<{
          group: SupportGroup;
        }>
      >(
        `/groups/${groupId}/moderators/${userId}`
      );

    return response.data;
  },

  async getMyAssignedGroups(): Promise<
    ApiResponse<{
      groups: SupportGroup[];
      totalGroups: number;
    }>
  > {
    const response =
      await apiClient.get<
        ApiResponse<{
          groups: SupportGroup[];
          totalGroups: number;
        }>
      >(
        "/groups/my-assigned"
      );

    return response.data;
  },
};