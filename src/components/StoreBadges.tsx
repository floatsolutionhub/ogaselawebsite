"use client";

import { ReactNode } from "react";
import { Apple, PlayCircle } from "lucide-react";
import clsx from "clsx";
import { useLaunch } from "./LaunchProvider";

/**
 * The App Store / Google Play badges. A badge only links somewhere once the app is live and its
 * store URL is set in .env (NEXT_APPSTORE_URL / NEXT_PLAYSTORE_URL); until then it shows
 * "Coming soon" and isn't a link, so there's never a dead link.
 */
export function StoreBadges({
  variant = "dark",
  className,
}: {
  variant?: "dark" | "light";
  className?: string;
}) {
  const { appLive, appStoreUrl, playStoreUrl } = useLaunch();

  return (
    <div className={clsx("flex flex-wrap items-center gap-3", className)}>
      <Badge
        variant={variant}
        url={appLive ? appStoreUrl : null}
        icon={<Apple size={22} />}
        caption="Download on the"
        store="App Store"
      />
      <Badge
        variant={variant}
        url={appLive ? playStoreUrl : null}
        icon={<PlayCircle size={22} />}
        caption="Get it on"
        store="Google Play"
      />
    </div>
  );
}

function Badge({
  variant,
  url,
  icon,
  caption,
  store,
}: {
  variant: "dark" | "light";
  url: string | null;
  icon: ReactNode;
  caption: string;
  store: string;
}) {
  const classes = clsx(
    "flex items-center gap-2.5 rounded-xl px-4 py-2.5",
    variant === "dark" ? "bg-black text-white" : "bg-white text-ink-900 shadow-md shadow-ink-900/10",
    url ? "transition-transform hover:-translate-y-0.5" : "cursor-default opacity-70"
  );
  const content = (
    <>
      {icon}
      <span className="text-left leading-tight">
        <span
          className={clsx(
            "block text-[9px] uppercase tracking-wide",
            variant === "dark" ? "text-white/70" : "text-ink-500"
          )}
        >
          {url ? caption : "Coming soon to"}
        </span>
        <span className="block text-sm font-semibold">{store}</span>
      </span>
    </>
  );

  if (!url) {
    return (
      <span className={classes} aria-label={`Coming soon to ${store}`}>
        {content}
      </span>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={classes}>
      {content}
    </a>
  );
}
