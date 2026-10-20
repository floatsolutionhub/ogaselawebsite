import Link from "next/link";
import clsx from "clsx";
import { BadgeCheck, Check, Circle, Clock, ShieldAlert, Store, X } from "lucide-react";

import type { VerificationItemKey, VerificationItemState, VerificationTrack } from "@/lib/api/types";

const COPY = {
  personal: {
    title: "Your account isn't verified",
    pendingTitle: "Account verification pending review",
    verifiedTitle: "Account verified",
    href: "/account/personal",
    Icon: ShieldAlert,
  },
  business: {
    title: "Your business isn't verified",
    pendingTitle: "Business verification pending review",
    verifiedTitle: "Business verified",
    href: "/account/business",
    Icon: Store,
  },
} as const;

const ITEM_LABELS: Record<VerificationItemKey, string> = {
  Selfie: "Selfie",
  IdCard: "ID card",
  UtilityBill: "Utility bill",
  BusinessRegistration: "Registration",
  OfficeUtilityBill: "Office address",
};

const LOWER_LABELS: Record<VerificationItemKey, string> = {
  Selfie: "selfie",
  IdCard: "ID card",
  UtilityBill: "utility bill",
  BusinessRegistration: "business registration",
  OfficeUtilityBill: "proof of office address",
};

const ITEM_STYLE: Record<VerificationItemState, { Icon: typeof Check; className: string; label: string }> = {
  Approved: { Icon: Check, className: "bg-brand-50 text-brand-700", label: "approved" },
  Submitted: { Icon: Clock, className: "bg-gold-100 text-gold-800", label: "in review" },
  Rejected: { Icon: X, className: "bg-danger/10 text-danger", label: "rejected" },
  Missing: { Icon: Circle, className: "bg-white text-ink-500", label: "not uploaded" },
};

function joinLabels(labels: string[]): string {
  if (labels.length <= 1) return labels.join("");
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

/**
 * One verification track's standing, as the app's VerificationBadge: verified, pending review
 * (with View submissions), or what's missing (with Verify) - plus the item checklist.
 */
export function VerificationBanner({ kind, track, note }: { kind: keyof typeof COPY; track: VerificationTrack; note?: string }) {
  const copy = COPY[kind];
  if (track.status === "Verified") {
    return (
      <p className="flex items-center gap-2 rounded-2xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700 ring-1 ring-brand-100">
        <BadgeCheck aria-hidden className="size-5" /> {copy.verifiedTitle}
      </p>
    );
  }
  const pending = track.status === "PendingReview";
  const outstanding = track.items.filter((i) => i.state === "Missing" || i.state === "Rejected").map((i) => LOWER_LABELS[i.key]);
  const Icon = pending ? Clock : copy.Icon;

  return (
    <div className={clsx("rounded-2xl p-4 ring-1", pending ? "bg-brand-50 ring-brand-100" : "bg-gold-50 ring-gold-200")}>
      <div className="flex items-center gap-3">
        <Icon aria-hidden className={clsx("size-6 shrink-0", pending ? "text-brand-600" : "text-gold-700")} />
        <p className="flex-1 text-sm font-semibold">{pending ? copy.pendingTitle : copy.title}</p>
        <Link
          href={copy.href}
          className={clsx(
            "shrink-0 rounded-full px-4 py-2 text-xs font-semibold",
            pending ? "bg-brand-600 text-white hover:bg-brand-500" : "bg-gold-500 text-ink-900 hover:bg-gold-400",
          )}
        >
          {pending ? "View submissions" : "Verify"}
        </Link>
      </div>
      {note && <p className="mt-2 text-sm text-ink-700">{note}</p>}
      {!pending && outstanding.length > 0 && <p className="mt-2 text-xs text-ink-700">Awaiting {joinLabels(outstanding)} upload</p>}
      {track.items.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {track.items.map((item) => {
            const style = ITEM_STYLE[item.state];
            return (
              <li
                key={item.key}
                className={clsx("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-black/5", style.className)}
                aria-label={`${ITEM_LABELS[item.key]}: ${style.label}`}
              >
                <style.Icon aria-hidden className="size-3" strokeWidth={2.5} /> {ITEM_LABELS[item.key]}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
