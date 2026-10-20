import Link from "next/link";
import { Flame, ImageOff, MapPin } from "lucide-react";

import { FavouriteButton } from "@/components/favourites/FavouriteButton";
import type { SearchResultItem } from "@/lib/api/types";
import { formatNaira, safeHttpUrl, timeAgo } from "@/lib/format";

export function ListingCard({ item, priority = false }: { item: SearchResultItem; priority?: boolean }) {
  const image = safeHttpUrl(item.thumbnailUrl);
  const promoted = item.planTier && item.planTier !== "Free";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-canvas-dark/60 bg-white shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden bg-canvas">
        {image ? (
          // Listing photos come from the API's storage host; a plain <img> avoids turning this
          // server into an open image proxy (next/image would need a wildcard remotePattern).
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            referrerPolicy="no-referrer"
            className="size-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid size-full place-items-center text-ink-300">
            <ImageOff aria-hidden className="size-8" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          {promoted && (
            <span className="inline-flex items-center gap-1 rounded-full bg-clay px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
              <Flame aria-hidden className="size-3" /> {item.planTier}
            </span>
          )}
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-brand-700 shadow-sm backdrop-blur">
            {item.condition === "New" ? "Brand new" : "Used"}
          </span>
        </div>
        <div className="absolute right-3 top-3 z-10">
          <FavouriteButton listingId={item.id} title={item.title} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="price-tag w-fit rounded-r-md py-1 pr-3 text-[15px] font-bold">{formatNaira(item.price)}</span>
        <h3 className="line-clamp-2 text-[15px] font-medium leading-snug text-ink-900">
          <Link href={`/listing/${item.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {item.title}
          </Link>
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1 text-xs text-ink-500">
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPin aria-hidden className="size-3.5 shrink-0" />
            <span className="truncate">{item.location || "Nigeria"}</span>
          </span>
          <span className="shrink-0">{timeAgo(item.publishedAt ?? item.createdAt)}</span>
        </div>
      </div>
    </article>
  );
}

export function ListingGrid({ items, priorityCount = 0 }: { items: SearchResultItem[]; priorityCount?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
      {items.map((item, i) => (
        <li key={item.id} className="animate-rise" style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}>
          <ListingCard item={item} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}

export function ListingGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul aria-hidden className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="overflow-hidden rounded-2xl border border-canvas-dark/60 bg-white">
          <div className="skeleton aspect-[4/3]" />
          <div className="space-y-2.5 p-4">
            <div className="skeleton h-6 w-24 rounded-md" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-3 w-2/3 rounded" />
          </div>
        </li>
      ))}
    </ul>
  );
}
