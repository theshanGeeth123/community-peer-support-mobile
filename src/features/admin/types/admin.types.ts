import type {
  AccountStatus,
  AuthProvider,
  AuthUser,
  UserRole,
} from "@/features/auth/types/auth.types";

export interface AdminUser extends AuthUser {
  hasLocalPassword?: boolean;
  isGoogleConnected?: boolean;

  lastLoginAt?: string | null;
  passwordChangedAt?: string | null;
}

export interface UserPagination {
  page: number;
  limit: number;

  totalUsers: number;
  totalPages: number;

  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UsersResponseData {
  users: AdminUser[];
  pagination: UserPagination;
}

export interface UserFilters {
  page?: number;
  limit?: number;

  search?: string;

  role?: UserRole;
  status?: AccountStatus;
  provider?: AuthProvider;
}