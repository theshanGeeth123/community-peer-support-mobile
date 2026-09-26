/*
 * Mirrors backend notification.constants.js NOTIFICATION_TYPE
 */
export type NotificationType = "POST_COMMENT" | "COMMENT_REPLY" | "POST_LIKE";

export interface AppNotification {
  id: string;
  type: NotificationType;
  isRead: boolean;

  actor: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  } | null;

  /*
   * How many people this represents (likes are grouped).
   */
  actorCount: number;

  group: { id: string; name: string } | null;

  /*
   * null when the post / comment has been deleted.
   */
  post: { id: string; preview: string | null } | null;
  comment: { id: string; preview: string | null } | null;

  createdAt: string;
  updatedAt: string;
}

export interface NotificationsPagination {
  page: number;
  limit: number;
  totalNotifications: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface NotificationsResponseData {
  notifications: AppNotification[];
  unreadCount: number;
  pagination: NotificationsPagination;
}
