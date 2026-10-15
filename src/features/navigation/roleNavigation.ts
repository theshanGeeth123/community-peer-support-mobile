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

const ROLE_GROUP_POSTS_PATHS: Record<
  UserRole,
  string
> = {
  USER:
    "/(app)/user/group/[groupId]/posts",

  PEER_SUPPORTER:
    "/(app)/peer-supporter/group/[groupId]/posts",

  MODERATOR:
    "/(app)/moderator/group/[groupId]/posts",

  ADMIN:
    "/(app)/admin/group/[groupId]/posts",
};

/*
 * A group's posts screen for the given role
 * (each role area has its own copy of the route).
 */
export interface GroupPostsFocus {
  /*
   * Post to scroll to and highlight.
   */
  postId: string;

  /*
   * Also open that post's comments.
   */
  openComments?: boolean;
}

export function getRoleGroupPostsRoute(
  role: UserRole,
  groupId: string,
  focus?: GroupPostsFocus
): Href {
  return {
    pathname:
      ROLE_GROUP_POSTS_PATHS[role],
    params: focus
      ? {
          groupId,
          focusPostId: focus.postId,
          openComments:
            focus.openComments ? "1" : "0",

          /*
           * Changes on every tap, so opening
           * the same post twice still works.
           */
          focusKey: String(Date.now()),
        }
      : { groupId },
  } as Href;
}