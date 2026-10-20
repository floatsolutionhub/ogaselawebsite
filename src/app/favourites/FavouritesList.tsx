"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

import { getFavouriteCards } from "@/app/actions/listings";
import { useFavourites } from "@/components/favourites/FavouritesProvider";
import { EmptyState } from "@/components/market/Badges";
import { ListingGrid, ListingGridSkeleton } from "@/components/market/ListingCard";
import { buttonClass } from "@/components/ui/styles";
import type { SearchResultItem } from "@/lib/api/types";

export function FavouritesList() {
  const { ids, remove } = useFavourites();
  const [loaded, setLoaded] = useState<{ key: string; items: SearchResultItem[] } | null>(null);
  const key = ids.join(",");

  useEffect(() => {
    if (ids.length === 0) return;
    let cancelled = false;
    getFavouriteCards(ids)
      .then(({ items, missing }) => {
        if (cancelled) return;
        setLoaded({ key, items });
        if (missing.length > 0) remove(missing);
      })
      .catch(() => {
        if (!cancelled) setLoaded({ key, items: [] });
      });
    return () => {
      cancelled = true;
    };
    // `key` captures the ids; re-fetch only when the set changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (ids.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Your basket is empty"
        action={
          <Link href="/" className={buttonClass("primary")}>
            Walk the market
          </Link>
        }
      >
        Tap the heart on any item to keep it here. Saved items stay on this device.
      </EmptyState>
    );
  }

  // While a removal re-fetches, keep showing the previous cards minus the removed ones.
  const items = loaded?.items.filter((item) => ids.includes(item.id));
  if (!items) return <ListingGridSkeleton count={Math.min(ids.length, 8)} />;
  if (items.length === 0 && loaded?.key === key) {
    return (
      <EmptyState icon={Heart} title="We couldn't load your saved items">
        Please refresh the page in a moment.
      </EmptyState>
    );
  }
  return <ListingGrid items={items} />;
}
