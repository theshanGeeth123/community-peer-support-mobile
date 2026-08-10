import type {
    AccountStatus,
    UserRole,
} from "@/features/auth/types/auth.types";

import type {
    GroupStatus,
} from "./group.types";

export type JoinRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export type GroupMembershipStatus =
  | "ACTIVE"
  | "SUSPENDED"
  | "REMOVED";

export interface GroupReferenceObject {
  id?: string;
  _id?: string;

  name?: string;
  description?: string;
  category?: string;

  communityLocation?:
    | string
    | null;

  rules?: string[];

  status?: GroupStatus;
}

export type GroupReference =
  | string
  | GroupReferenceObject;

export interface JoinRequestUser {
  id?: string;
  _id?: string;

  fullName?: string;
  email?: string;

  role?: UserRole;

  avatarUrl?:
    | string
    | null;

  accountStatus?: AccountStatus;
}

export interface GroupJoinRequest {
  id: string;

  group: GroupReference;

  user:
    | string
    | JoinRequestUser;

  reason: string;

  status: JoinRequestStatus;

  reviewedBy:
    | string
    | JoinRequestUser
    | null;

  reviewNote:
    | string
    | null;

  reviewedAt:
    | string
    | null;

  createdAt: string;
  updatedAt: string;
}

export interface GroupMembership {
  id: string;

  group: GroupReference;

  user:
    | string
    | JoinRequestUser;

  status: GroupMembershipStatus;

  joinedAt: string;

  suspendedAt:
    | string
    | null;

  removedAt:
    | string
    | null;

  lastUpdatedBy:
    | string
    | JoinRequestUser
    | null;

  statusReason:
    | string
    | null;

  createdAt: string;
  updatedAt: string;
}

export interface MyJoinRequestsResponseData {
  requests: GroupJoinRequest[];
  totalRequests: number;
}

export interface MyGroupsResponseData {
  memberships: GroupMembership[];
  totalGroups: number;
}

export interface GroupJoinRequestsResponseData {
  group: {
    id: string;
    name: string;
  };

  requests: GroupJoinRequest[];

  totalRequests: number;
}

export interface ModeratorGroupMembersResponseData {
  group: {
    id: string;
    name: string;
  };

  memberships: GroupMembership[];

  totalMembers: number;
}

export interface JoinGroupPayload {
  reason: string;
}

export interface ReviewJoinRequestPayload {
  reviewNote?:
    | string
    | null;
}

export interface ModerateMembershipPayload {
  reason: string;
}

export interface ReactivateMembershipPayload {
  reason?:
    | string
    | null;
}