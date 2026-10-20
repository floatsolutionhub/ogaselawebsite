"use client";

import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { Heart } from "lucide-react";

import { useViewer } from "@/components/providers/SessionProvider";
import { useFavourites } from "./FavouritesProvider";

export function FavouriteButton({
  listingId,
  title,
  variant = "overlay",
}: {
  listingId: string;
  title: string;
  variant?: "overlay" | "pill";
}) {
  const { isFavourite, toggle } = useFavourites();
  const viewer = useViewer();
  const router = useRouter();
  const pathname = usePathname();
  const saved = isFavourite(listingId);

  return (
    <button
      type="button"
      onClick={(event) => {
        // Cards are links - saving shouldn't open the ad.
        event.preventDefault();
        event.stopPropagation();
        // Same as the app: saving needs an account.
        if (!viewer) {
          router.push(`/sign-in?next=${encodeURIComponent(pathname)}`);
          return;
        }
        toggle(listingId);
      }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}
      className={clsx(
        "inline-flex items-center justify-center gap-2 transition",
        variant === "overlay"
          ? "size-9 rounded-full bg-white/90 shadow-sm backdrop-blur hover:scale-105"
          : "h-11 rounded-full border border-brand-200 bg-white px-5 text-sm font-semibold text-brand-700 hover:bg-brand-50",
      )}
    >
      <Heart
        aria-hidden
        className={clsx("size-[18px] transition", saved ? "fill-clay text-clay" : "text-ink-700")}
      />
      {variant === "pill" && (saved ? "Saved" : "Save")}
    </button>
  );
}
