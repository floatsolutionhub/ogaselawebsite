"use client";

import { useState } from "react";
import clsx from "clsx";
import { BadgeCheck, Megaphone } from "lucide-react";

import { setNotificationPreference } from "@/app/actions/account";
import { useToast } from "@/components/providers/ToastProvider";
import { cardClass } from "@/components/ui/styles";
import type { NotificationChannel, NotificationPreference } from "@/lib/api/types";

const CATEGORIES = [
  { key: "ListingLifecycle", icon: Megaphone, title: "Ad updates", description: "Approvals, rejections and ads about to expire" },
  { key: "Verification", icon: BadgeCheck, title: "Verification", description: "The outcome of your identity verification" },
];

const CHANNEL_LABELS: Partial<Record<NotificationChannel, string>> = {
  Push: "Push notifications (app)",
  Email: "Email",
};

/** Each switch saves on its own straight away (and flips back if the save fails), like the app. */
export function AlertSettings({ initial }: { initial: NotificationPreference[] }) {
  const toast = useToast();
  const [preferences, setPreferences] = useState(initial);

  const toggle = async (pref: NotificationPreference, enabled: boolean) => {
    const same = (p: NotificationPreference) => p.channel === pref.channel && p.category === pref.category;
    setPreferences((prev) => prev.map((p) => (same(p) ? { ...p, enabled } : p)));
    const result = await setNotificationPreference(pref.channel, pref.category, enabled);
    if (!result.ok) {
      setPreferences((prev) => prev.map((p) => (same(p) ? { ...p, enabled: !enabled } : p)));
      toast.error("Couldn't save that change", result.error);
    }
  };

  return (
    <div className="space-y-5">
      {CATEGORIES.map((category) => {
        const rows = preferences.filter((p) => p.category === category.key);
        if (rows.length === 0) return null;
        return (
          <section key={category.key} className={`${cardClass} overflow-hidden`}>
            <div className="flex items-start gap-3 border-b border-canvas-dark/60 px-5 py-4">
              <category.icon aria-hidden className="mt-0.5 size-5 text-brand-600" />
              <div>
                <h2 className="font-semibold">{category.title}</h2>
                <p className="text-sm text-ink-500">{category.description}</p>
              </div>
            </div>
            <ul className="divide-y divide-canvas-dark/60">
              {rows.map((pref) => (
                <li key={pref.channel} className="flex items-center justify-between px-5 py-3.5">
                  <span id={`pref-${category.key}-${pref.channel}`} className="text-sm font-medium">
                    {CHANNEL_LABELS[pref.channel] ?? pref.channel}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={pref.enabled}
                    aria-labelledby={`pref-${category.key}-${pref.channel}`}
                    onClick={() => toggle(pref, !pref.enabled)}
                    className={clsx("relative h-7 w-12 rounded-full transition", pref.enabled ? "bg-brand-600" : "bg-ink-300")}
                  >
                    <span className={clsx("absolute top-1 size-5 rounded-full bg-white shadow transition-all", pref.enabled ? "left-6" : "left-1")} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
