import "server-only";

import { cookies } from "next/headers";

import { LOCATION_COOKIE, parseLocation, type ShopLocation } from "./location";

export async function getShopLocation(): Promise<ShopLocation> {
  return parseLocation((await cookies()).get(LOCATION_COOKIE)?.value);
}
