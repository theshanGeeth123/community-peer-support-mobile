export type UserRole =
  | "USER"
  | "PEER_SUPPORTER"
  | "MODERATOR"
  | "ADMIN";

export type AuthProvider = "LOCAL" | "GOOGLE";

export type AccountStatus =
  | "ACTIVE"
  | "SUSPENDED"
  | "DEACTIVATED";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  authProviders: AuthProvider[];
  canUsePasswordLogin: boolean;
  isEmailVerified: boolean;
  accountStatus: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface RegisterResponseData {
  userId: string;
  email: string;
  isEmailVerified: boolean;
  otpExpiresInMinutes: number;
}

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponseData {
  user: AuthUser;
  token: string;
  tokenType: "Bearer";
  expiresInSeconds: number;
}

export interface GoogleLoginPayload {
  idToken: string;
}

export interface GoogleLoginResponseData
  extends LoginResponseData {
  isNewUser: boolean;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export interface UpdateProfilePayload {
  fullName?: string;
  avatarUrl?: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data: T;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}