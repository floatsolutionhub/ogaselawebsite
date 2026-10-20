import { z } from "zod";

// Where the visitor is shopping - the app's LocationContext, kept in a cookie so server-rendered
// pages (Hot Picks by city, nearest office) can use it. Not sensitive, so not httpOnly: the
// browser writes it when the visitor picks a place. Always validated when read.

export const LOCATION_COOKIE = "og_loc";

export type ShopLocation = {
  /** Empty when browsing nationwide. */
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  /** Has been asked once (the app's first-run location prompt). */
  onboarded: boolean;
};

export const DEFAULT_LOCATION: ShopLocation = { city: "", state: "", latitude: null, longitude: null, onboarded: false };

const schema = z.object({
  city: z.string().max(80).catch(""),
  state: z.string().max(80).catch(""),
  latitude: z.number().min(-90).max(90).nullable().catch(null),
  longitude: z.number().min(-180).max(180).nullable().catch(null),
  onboarded: z.boolean().catch(false),
});

export function parseLocation(raw: string | undefined): ShopLocation {
  if (!raw) return DEFAULT_LOCATION;
  try {
    const parsed = schema.safeParse(JSON.parse(decodeURIComponent(raw)));
    return parsed.success ? parsed.data : DEFAULT_LOCATION;
  } catch {
    return DEFAULT_LOCATION;
  }
}

export function locationLabel(location: ShopLocation): string {
  if (!location.city && !location.state) return "All of Nigeria";
  return location.city ? `${location.city}, ${location.state}` : location.state;
}
