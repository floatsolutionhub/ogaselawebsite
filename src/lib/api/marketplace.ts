import "server-only";

import { cache } from "react";

import { api } from "./client";
import type {
  Category,
  ListingCondition,
  ListingDetail,
  Listing,
  PagedResult,
  PagedReviews,
  SearchResultItem,
  SearchSort,
  SellerProfile,
} from "./types";

// Ogasela.API routes the public marketplace pages use - same routes as
// OgaselaMobileClient/src/services/{categories,listings,search,sellers,reviews}.ts.

/** Flat list - parent/child is built from parentCategoryId. Deduped within one render. */
export const getCategories = cache(() => api.get<Category[]>("/categories", false));

export function getHotPicks(params: { page: number; pageSize: number; seed: number; categoryId?: string; location?: string }) {
  const query = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    seed: String(params.seed),
  });
  if (params.categoryId) query.set("categoryId", params.categoryId);
  if (params.location) query.set("location", params.location);
  return api.get<PagedResult<SearchResultItem>>(`/listings/hot?${query}`);
}

export interface SearchFilters {
  query?: string;
  categoryId?: string;
  location?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  minPrice?: number;
  maxPrice?: number;
  condition?: ListingCondition;
  verifiedSellerOnly?: boolean;
  sort?: SearchSort;
  page?: number;
  pageSize?: number;
}

export function search(filters: SearchFilters) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "" && value !== false) {
      query.set(key, String(value));
    }
  }
  return api.get<PagedResult<SearchResultItem>>(`/search?${query}`);
}

/** Signed in, seller.phone is filled in. Deduped so generateMetadata and the page share one call. */
export const getListing = cache((id: string) => api.get<ListingDetail>(`/listings/${id}`));

export const getSeller = cache((sellerProfileId: string) => api.get<SellerProfile>(`/sellers/${sellerProfileId}`));

export function getSellerListings(sellerProfileId: string, page = 1, pageSize = 24) {
  return api.get<PagedResult<Listing>>(`/sellers/${sellerProfileId}/listings?page=${page}&pageSize=${pageSize}`);
}

export function getSellerReviews(sellerProfileId: string, page = 1, pageSize = 10) {
  return api.get<PagedReviews>(`/sellers/${sellerProfileId}/reviews?page=${page}&pageSize=${pageSize}`);
}

/** Fire-and-forget engagement only the client sees (Call taps, saves) - feeds seller analytics. */
export async function recordEngagement(listingId: string, engagement: "CallClick" | "Save") {
  await api.post<void>(`/listings/${listingId}/engagements`, { engagement }).catch(() => {});
}

/** Seller listings come back as Listing; cards render SearchResultItem. */
export function toCardItem(listing: Listing): SearchResultItem {
  return {
    id: listing.id,
    sellerId: listing.sellerId,
    categoryId: listing.categoryId,
    title: listing.title,
    description: listing.description,
    thumbnailUrl: listing.mediaUrls[0] ?? null,
    price: listing.price,
    condition: listing.condition,
    location: listing.location,
    latitude: listing.latitude,
    longitude: listing.longitude,
    publishedAt: listing.publishedAt,
    createdAt: listing.createdAt,
    planTier: "Free",
    distanceKm: null,
    score: 0,
  };
}
