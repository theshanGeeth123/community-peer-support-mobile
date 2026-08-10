import type {
    AccountStatus,
    UserRole,
} from "@/features/auth/types/auth.types";

export type GroupStatus =
  | "ACTIVE"
  | "INACTIVE";

export interface GroupUserSummary {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
  accountStatus?: AccountStatus;
}

export type GroupUserReference =
  | string
  | GroupUserSummary;

export interface SupportGroup {
  id: string;

  name: string;
  description: string;
  category: string;

  communityLocation:
    | string
    | null;

  rules: string[];

  peerSupporters:
    GroupUserReference[];

  moderators:
    GroupUserReference[];

  status: GroupStatus;

  createdBy:
    | string
    | GroupUserSummary;

  createdAt: string;
  updatedAt: string;

  peerSupporterCount?: number;
  moderatorCount?: number;
}

export interface GroupPagination {
  page: number;
  limit: number;

  totalGroups: number;
  totalPages: number;

  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GroupsResponseData {
  groups: SupportGroup[];

  pagination: GroupPagination;
}

export interface GroupFilters {
  page?: number;
  limit?: number;

  search?: string;

  category?: string;

  status?: GroupStatus;
}

export interface CreateGroupPayload {
  name: string;

  description: string;

  category: string;

  communityLocation?:
    | string
    | null;

  rules?: string[];
}

export interface UpdateGroupPayload {
  name?: string;

  description?: string;

  category?: string;

  communityLocation?:
    | string
    | null;

  rules?: string[];

  status?: GroupStatus;
}