"use client";

import { useState } from "react";
import clsx from "clsx";
import { ChevronDown, MapPin } from "lucide-react";

import { useShopLocation } from "@/components/providers/LocationProvider";
import { LocationDialog } from "./LocationDialog";

export function LocationPill({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const { label } = useShopLocation();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={clsx(
          "h-10 max-w-52 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition",
          tone === "dark" ? "bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/20" : "bg-white text-ink-900 shadow-card ring-1 ring-canvas-dark/60 hover:ring-brand-300",
          className ?? "inline-flex",
        )}
      >
        <MapPin aria-hidden className={clsx("size-4 shrink-0", tone === "dark" ? "text-gold-300" : "text-brand-600")} />
        <span className="truncate">{label}</span>
        <ChevronDown aria-hidden className="size-4 shrink-0 opacity-70" />
      </button>
      <LocationDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
