import "server-only";

import { api } from "../client";
import type {
  ListingAnalytics,
  AnalyticsDays,
  Listing,
  ListingCheckout,
  ListingCopySuggestion,
  ListingCondition,
  ListingInput,
  PriceSuggestion,
  PromotionPlan,
  SellerAnalytics,
} from "../types";

// Posting and managing ads - ListingsController.cs, PromotionPlansController.cs, AiController.cs,
// AnalyticsController.cs.

export const getListingForEdit = (id: string) => api.get<Listing>(`/listings/${id}`);
export const createDraft = (input: ListingInput) => api.post<Listing>("/listings", input);
export const updateListing = (id: string, input: ListingInput) => api.put<Listing>(`/listings/${id}`, input);

export function uploadListingImage(image: File) {
  const form = new FormData();
  form.append("image", image, image.name);
  return api.postForm<{ url: string }>("/listings/images", form);
}

/** Includes inactive plans - filter on isActive. Prices are in kobo. */
export const getPromotionPlans = () => api.get<PromotionPlan[]>("/promotion-plans", false);

export const checkout = (id: string, promotionPlanId: string, returnUrl: string) =>
  api.post<ListingCheckout>(`/listings/${id}/checkout`, { promotionPlanId, paymentMethod: "Card", returnUrl });
export const confirmCheckout = (id: string, reference: string) =>
  api.post<ListingCheckout>(`/listings/${id}/checkout/${encodeURIComponent(reference)}/confirm`);
export const cancelCheckout = (id: string, reference: string) =>
  api.post<ListingCheckout>(`/listings/${id}/checkout/${encodeURIComponent(reference)}/cancel`);

export const reportListing = (id: string, reason: string) => api.post<void>(`/listings/${id}/report`, { reason });

/** promotionPlanId null while posting - the tools are free then. */
export const generateDescription = (keywords: string | null, imageRef: string | null) =>
  api.post<ListingCopySuggestion>("/ai/generate-description", { promotionPlanId: null, keywords, imageRef });
export const suggestPrice = (categoryId: string, title: string, condition: ListingCondition) =>
  api.post<PriceSuggestion>("/ai/suggest-price", { promotionPlanId: null, categoryId, title, condition });

export const getSellerAnalytics = (days: AnalyticsDays) => api.get<SellerAnalytics>(`/me/analytics?days=${days}`);
export const getListingAnalytics = (id: string, days: AnalyticsDays) =>
  api.get<ListingAnalytics>(`/me/analytics/listings/${id}?days=${days}`);
