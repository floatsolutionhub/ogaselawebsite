"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

/**
 * Google Maps only loads after the visitor asks for it - the embed sets Google's own cookies, and
 * the site otherwise uses none beyond what it needs to work (see the Privacy Policy, Cookies).
 */
export function MapEmbed({ query, title }: { query: string; title: string }) {
  const [loaded, setLoaded] = useState(false);

  if (loaded) {
    return (
      <iframe
        title={title}
        src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
        className="h-[420px] w-full border-0 lg:h-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }

  return (
    <div className="flex h-[420px] w-full flex-col items-center justify-center gap-4 bg-brand-50 p-8 text-center lg:h-full">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm">
        <MapPin size={26} />
      </span>
      <p className="max-w-xs text-sm text-ink-500">
        The map is provided by Google, which may set cookies when it loads.
      </p>
      <button
        type="button"
        onClick={() => setLoaded(true)}
        className="rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-brand-600/20 hover:bg-brand-700"
      >
        Show map
      </button>
    </div>
  );
}
