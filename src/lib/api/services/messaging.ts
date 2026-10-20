import "server-only";

import { api } from "../client";
import type { BlockedUser, Conversation, InboxPage, Message, NotificationPreference, PagedResult } from "../types";

// ConversationsController.cs, UsersController.cs, ReportsController.cs, InboxController.cs,
// NotificationsController.cs.

export const startConversation = (listingId: string) => api.post<Conversation>("/conversations", { listingId });
export const getConversations = (page = 1, pageSize = 50) =>
  api.get<PagedResult<Conversation>>(`/conversations?page=${page}&pageSize=${pageSize}`);
export const getConversation = (id: string) => api.get<Conversation>(`/conversations/${id}`);
export const getSafetyNotice = () => api.get<{ text: string }>("/conversations/safety-notice");
export const getUnreadMessageCount = () => api.get<number>("/conversations/unread-count");
/** Also marks the other party's messages read. Oldest first within the page. */
export const getMessages = (id: string, page = 1, pageSize = 50) =>
  api.get<PagedResult<Message>>(`/conversations/${id}/messages?page=${page}&pageSize=${pageSize}`);
export const sendMessage = (id: string, content: string) =>
  api.post<Message>(`/conversations/${id}/messages`, { content, imageUrl: null });

export const blockUser = (userId: string) => api.post<void>(`/users/${userId}/block`);
export const unblockUser = (userId: string) => api.del<void>(`/users/${userId}/block`);
export const getBlockedUsers = () => api.get<BlockedUser[]>("/users/blocked");
export const reportUser = (targetUserId: string, reason: string) => api.post<void>("/reports", { targetUserId, reason });

export const getInbox = (page = 1, pageSize = 20) => api.get<InboxPage>(`/me/inbox?page=${page}&pageSize=${pageSize}`);
export const getInboxUnreadCount = () => api.get<number>("/me/inbox/unread-count");
export const markInboxRead = (id: string) => api.post<void>(`/me/inbox/${id}/read`);
export const markAllInboxRead = () => api.post<void>("/me/inbox/read-all");

export const getNotificationPreferences = () => api.get<NotificationPreference[]>("/notifications/preferences");
export const updateNotificationPreferences = (preferences: NotificationPreference[]) =>
  api.put<void>("/notifications/preferences", { preferences });
