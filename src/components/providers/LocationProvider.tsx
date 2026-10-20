"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { LOCATION_COOKIE, locationLabel, type ShopLocation } from "@/lib/location";

type LocationValue = ShopLocation & {
  label: string;
  isNationwide: boolean;
  coords: { latitude: number; longitude: number } | null;
  setLocation: (next: Partial<ShopLocation>) => void;
};

const LocationContext = createContext<LocationValue | null>(null);

function writeCookie(value: ShopLocation) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${LOCATION_COOKIE}=${encodeURIComponent(JSON.stringify(value))}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}

export function LocationProvider({ initial, children }: { initial: ShopLocation; children: React.ReactNode }) {
  const router = useRouter();
  const [location, setState] = useState(initial);

  const setLocation = useCallback(
    (next: Partial<ShopLocation>) => {
      setState((prev) => {
        const value = { ...prev, ...next, onboarded: true };
        writeCookie(value);
        return value;
      });
      // Server-rendered lists (Hot Picks by city) re-render for the new place.
      router.refresh();
    },
    [router],
  );

  const value = useMemo<LocationValue>(
    () => ({
      ...location,
      label: locationLabel(location),
      isNationwide: !location.city && !location.state,
      coords:
        location.latitude !== null && location.longitude !== null
          ? { latitude: location.latitude, longitude: location.longitude }
          : null,
      setLocation,
    }),
    [location, setLocation],
  );

  return <LocationContext value={value}>{children}</LocationContext>;
}

export function useShopLocation(): LocationValue {
  const value = useContext(LocationContext);
  if (!value) throw new Error("useShopLocation must be used within LocationProvider");
  return value;
}
