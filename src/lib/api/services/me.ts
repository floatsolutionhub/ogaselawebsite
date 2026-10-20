import "server-only";

import { api } from "../client";
import type {
  CurrentUser,
  IdDocumentType,
  ProfileChange,
  UserDocument,
  UserDocumentType,
  VerificationOverview,
} from "../types";

// MeController.cs - same routes as OgaselaMobileClient/src/services/me.ts.

export const getCurrentUser = () => api.get<CurrentUser>("/me");
export const deleteMyAccount = () => api.del<void>("/me");
export const updateProfile = (name: string) => api.patch<void>("/me/profile", { name });
export const getMyChangeRequests = () => api.get<ProfileChange[]>("/me/change-requests");
export const requestContactChangeCode = (type: "Phone" | "Email", value: string) =>
  api.post<void>("/me/change-requests/contact/code", { type, value });
export const submitContactChange = (type: "Phone" | "Email", value: string, code: string) =>
  api.post<ProfileChange>("/me/change-requests/contact", { type, value, code });
export const submitBusinessInfoChange = (businessName: string, storeAddress: string) =>
  api.post<ProfileChange>("/me/change-requests/business", { businessName, storeAddress });
export const cancelChangeRequest = (id: string) => api.del<void>(`/me/change-requests/${id}`);

/** The API rejects it unless it shows exactly one clear face. */
export function uploadProfilePhoto(image: File) {
  const form = new FormData();
  form.append("image", image, image.name);
  return api.postForm<{ url: string }>("/me/photo", form);
}

export const getVerificationOverview = () => api.get<VerificationOverview>("/me/verification");
export const getMyDocuments = () => api.get<UserDocument[]>("/me/documents");

export function uploadDocument(input: { type: UserDocumentType; idType?: IdDocumentType; idNumber?: string; file: File }) {
  const form = new FormData();
  form.append("type", input.type);
  if (input.idType) form.append("idType", input.idType);
  if (input.idNumber) form.append("idNumber", input.idNumber);
  form.append("file", input.file, input.file.name);
  return api.postForm<UserDocument>("/me/documents", form);
}
