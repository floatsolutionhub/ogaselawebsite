import Link from "next/link";
import clsx from "clsx";
import { BadgeCheck, ChevronRight, Clock, Lock, ShieldAlert } from "lucide-react";

import type { VerificationTrackStatus } from "@/lib/api/types";

const STYLE: Record<VerificationTrackStatus | "Locked", { text: string; Icon: typeof BadgeCheck; className: string }> = {
  Verified: { text: "Verified", Icon: BadgeCheck, className: "bg-brand-50 text-brand-700" },
  PendingReview: { text: "Pending review", Icon: Clock, className: "bg-gold-50 text-gold-800" },
  InProgress: { text: "Not verified", Icon: ShieldAlert, className: "bg-danger/10 text-danger" },
  NotStarted: { text: "Not verified", Icon: ShieldAlert, className: "bg-danger/10 text-danger" },
  // Buyers: a business comes once the account is verified.
  Locked: { text: "After account verification", Icon: Lock, className: "bg-canvas text-ink-500" },
};

/** "Account: Verified" - links to where the user can act on it. */
export function StatusPill({ label, status, href }: { label: string; status: VerificationTrackStatus | null; href?: string }) {
  const style = STYLE[status ?? "Locked"];
  const body = (
    <>
      <style.Icon aria-hidden className="size-3.5" />
      {label}: {style.text}
      {href && status !== "Verified" && <ChevronRight aria-hidden className="size-3.5" />}
    </>
  );
  const className = clsx("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold", style.className);
  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <span className={className}>{body}</span>
  );
}
