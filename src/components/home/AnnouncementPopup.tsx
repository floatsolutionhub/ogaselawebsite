"use client";

import { useState, useSyncExternalStore } from "react";
import { X } from "lucide-react";

import { safeHttpUrl } from "@/lib/format";
import { getActiveAnnouncements, settle } from "@/lib/market/api";
import { useApi } from "@/lib/market/useApi";

const DISMISSED_KEY = "ogasela_dismissed_announcements_v1";

function readDismissed(): string {
  try {
    return localStorage.getItem(DISMISSED_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function parseDismissed(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

const noSubscribe = () => () => {};

/** The newest announcement this browser hasn't closed, like the app's home screen. */
export function AnnouncementPopup() {
  const loaded = useApi("announcements", () => settle(getActiveAnnouncements()));
  const announcements = (loaded.status === "ready" ? loaded.data : null) ?? [];
  const [closedIds, setClosedIds] = useState<string[]>([]);
  // Read once on the client; the server render shows nothing.
  const stored = useSyncExternalStore(noSubscribe, readDismissed, () => null);
  const seen = [...parseDismissed(stored ?? "[]"), ...closedIds];
  const announcement = stored !== null ? (announcements.find((a) => !seen.includes(a.id)) ?? null) : null;

  if (!announcement) return null;

  const close = () => {
    try {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify([...parseDismissed(readDismissed()), announcement.id].slice(-100)));
    } catch {
      // Storage blocked - it'll show again next visit.
    }
    setClosedIds((ids) => [...ids, announcement.id]);
  };

  const image = safeHttpUrl(announcement.image);
  const ctaUrl = safeHttpUrl(announcement.cta?.url);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="announcement-title" className="fixed inset-0 z-50 grid place-items-center bg-ink-900/50 p-6">
      <div className="animate-rise w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-lift">
        <div className="relative">
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" referrerPolicy="no-referrer" className="aspect-[4/3] w-full object-cover" />
          )}
          <button type="button" onClick={close} aria-label="Close" className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 shadow">
            <X aria-hidden className="size-5" />
          </button>
        </div>
        <div className="p-6">
          <h2 id="announcement-title" className="text-xl font-bold">
            {announcement.title}
          </h2>
          <p className="mt-2 whitespace-pre-line text-ink-700">{announcement.caption}</p>
          {announcement.cta && ctaUrl && (
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white hover:bg-brand-500"
            >
              {announcement.cta.label}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
