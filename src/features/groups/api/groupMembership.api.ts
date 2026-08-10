import apiClient from "@/services/api/apiClient";

import type {
    ApiResponse,
} from "@/features/auth/types/auth.types";

import type {
    GroupJoinRequest,
    GroupJoinRequestsResponseData,
    JoinGroupPayload,
    MyGroupsResponseData,
    MyJoinRequestsResponseData,
    ReviewJoinRequestPayload,
} from "../types/groupMembership.types";

export const groupMembershipApi = {
  async requestToJoinGroup(
    groupId: string,
    payload: JoinGroupPayload
  ): Promise<
    ApiResponse<{
      joinRequest: GroupJoinRequest;
    }>
  > {
    const response =
      await apiClient.post<
        ApiResponse<{
          joinRequest: GroupJoinRequest;
        }>
      >(
        `/group-memberships/groups/${groupId}/join-request`,
        payload
      );

    return response.data;
  },

  async getMyJoinRequests(): Promise<
    ApiResponse<MyJoinRequestsResponseData>
  > {
    const response =
      await apiClient.get<
        ApiResponse<MyJoinRequestsResponseData>
      >(
        "/group-memberships/my-requests"
      );

    return response.data;
  },

  async getMyJoinedGroups(): Promise<
    ApiResponse<MyGroupsResponseData>
  > {
    const response =
      await apiClient.get<
        ApiResponse<MyGroupsResponseData>
      >(
        "/group-memberships/my-groups"
      );

    return response.data;
  },

  async getGroupJoinRequests(
    groupId: string
  ): Promise<
    ApiResponse<GroupJoinRequestsResponseData>
  > {
    const response =
      await apiClient.get<
        ApiResponse<GroupJoinRequestsResponseData>
      >(
        `/group-memberships/groups/${groupId}/join-requests`
      );

    return response.data;
  },

  async approveJoinRequest(
    requestId: string,
    payload: ReviewJoinRequestPayload = {}
  ): Promise<
    ApiResponse<{
      joinRequest: GroupJoinRequest;
    }>
  > {
    const response =
      await apiClient.patch<
        ApiResponse<{
          joinRequest: GroupJoinRequest;
        }>
      >(
        `/group-memberships/join-requests/${requestId}/approve`,
        payload
      );

    return response.data;
  },

  async rejectJoinRequest(
    requestId: string,
    payload: ReviewJoinRequestPayload = {}
  ): Promise<
    ApiResponse<{
      joinRequest: GroupJoinRequest;
    }>
  > {
    const response =
      await apiClient.patch<
        ApiResponse<{
          joinRequest: GroupJoinRequest;
        }>
      >(
        `/group-memberships/join-requests/${requestId}/reject`,
        payload
      );

    return response.data;
  },
};