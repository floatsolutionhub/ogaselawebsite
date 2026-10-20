"use client";

import { Clock, XCircle } from "lucide-react";

import type { ProfileChange } from "@/lib/api/types";
import { dateTime } from "@/lib/format";

/**
 * Where the latest change of one kind stands: awaiting approval (with a way to withdraw it) or
 * rejected with the reviewer's reason. Approved or withdrawn changes show nothing.
 */
export function ChangeRequestBanner({
  change,
  pendingText,
  onWithdraw,
  withdrawing,
}: {
  change?: ProfileChange;
  pendingText: string;
  onWithdraw: () => void;
  withdrawing: boolean;
}) {
  if (change?.status === "PendingReview") {
    return (
      <div className="flex gap-3 rounded-2xl bg-gold-50 p-4 ring-1 ring-gold-200">
        <Clock aria-hidden className="mt-0.5 size-5 shrink-0 text-gold-700" />
        <div className="text-sm">
          <p className="font-semibold text-gold-800">Awaiting approval</p>
          <p className="mt-0.5 font-medium text-ink-900">{pendingText}</p>
          <p className="mt-1 text-ink-700">Submitted {dateTime(change.createdAt)}. Your current details stay in use until it&apos;s approved.</p>
          <button type="button" onClick={onWithdraw} disabled={withdrawing} className="mt-2 font-semibold text-danger">
            {withdrawing ? "Withdrawing…" : "Withdraw request"}
          </button>
        </div>
      </div>
    );
  }
  if (change?.status === "Rejected") {
    return (
      <div className="flex gap-3 rounded-2xl bg-danger/5 p-4 ring-1 ring-danger/20">
        <XCircle aria-hidden className="mt-0.5 size-5 shrink-0 text-danger" />
        <div className="text-sm">
          <p className="font-semibold text-danger">Last request wasn&apos;t approved</p>
          {change.reviewNote && <p className="mt-0.5 text-ink-700">{change.reviewNote}</p>}
          <p className="mt-1 text-ink-500">You can submit it again below.</p>
        </div>
      </div>
    );
  }
  return null;
}
