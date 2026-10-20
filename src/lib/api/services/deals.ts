import "server-only";

import { api } from "../client";
import type {
  DisputeDetail,
  DisputeReason,
  DisputeSummary,
  DisputeThreadMessage,
  OfficeBranch,
  OfficePickupCheckout,
  OfficePickupDetail,
  OfficePickupQuote,
  OfficePickupSummary,
} from "../types";

// DisputesController.cs and OfficePickupsController.cs.

export function raiseDispute(input: {
  listingId: string;
  conversationId: string | null;
  reason: DisputeReason;
  description: string;
  evidence: File[];
}) {
  const form = new FormData();
  form.append("listingId", input.listingId);
  if (input.conversationId) form.append("conversationId", input.conversationId);
  form.append("reason", input.reason);
  form.append("description", input.description);
  for (const file of input.evidence) form.append("evidence", file, file.name);
  return api.postForm<DisputeSummary>("/disputes", form);
}

export const getMyDisputes = () => api.get<DisputeSummary[]>("/disputes/mine");
export const getDispute = (id: string) => api.get<DisputeDetail>(`/disputes/${id}`);

export function replyToDispute(id: string, body: string, attachment: File | null) {
  const form = new FormData();
  form.append("body", body);
  if (attachment) form.append("attachment", attachment, attachment.name);
  return api.postForm<DisputeThreadMessage>(`/disputes/${id}/messages`, form);
}

export function getBranches(coords: { latitude: number; longitude: number } | null) {
  const query = coords ? `?latitude=${coords.latitude}&longitude=${coords.longitude}` : "";
  return api.get<OfficeBranch[]>(`/office-pickups/branches${query}`);
}
export const getPickupQuote = (listingId: string) => api.get<OfficePickupQuote>(`/office-pickups/quote/${listingId}`);
export const startPickup = (listingId: string, branchId: string, returnUrl: string) =>
  api.post<OfficePickupCheckout>("/office-pickups", { listingId, branchId, returnUrl });
export const cancelPickupPayment = (id: string) => api.post<OfficePickupDetail>(`/office-pickups/${id}/cancel-payment`);
export const confirmPickupPayment = (id: string) => api.post<OfficePickupDetail>(`/office-pickups/${id}/confirm-payment`);
export const getMyPickups = () => api.get<OfficePickupSummary[]>("/office-pickups/mine");
export const getPickup = (id: string) => api.get<OfficePickupDetail>(`/office-pickups/${id}`);
export const requestPickupCancellation = (id: string, reason: string) =>
  api.post<OfficePickupDetail>(`/office-pickups/${id}/cancel`, { reason });
