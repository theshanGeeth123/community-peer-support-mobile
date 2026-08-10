import type { Href } from "expo-router";

import type {
    UserRole,
} from "@/features/auth/types/auth.types";

const ROLE_HOME_ROUTES: Record<
  UserRole,
  Href
> = {
  USER:
    "/(app)/user/home" as Href,

  PEER_SUPPORTER:
    "/(app)/peer-supporter/home" as Href,

  MODERATOR:
    "/(app)/moderator/home" as Href,

  ADMIN:
    "/(app)/admin/dashboard" as Href,
};

export function getRoleHomeRoute(
  role: UserRole
): Href {
  return ROLE_HOME_ROUTES[role];
}