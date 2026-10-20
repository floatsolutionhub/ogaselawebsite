"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Ban } from "lucide-react";

import { setBlocked } from "@/app/actions/listings";
import { useToast } from "@/components/providers/ToastProvider";

/** Shown in place of a blocked seller's ads. */
export function BlockedSellerNotice({ userId }: { userId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [working, startWorking] = useTransition();
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-5 shadow-card ring-1 ring-canvas-dark/60">
      <Ban aria-hidden className="size-6 shrink-0 text-ink-500" />
      <p className="flex-1 text-sm text-ink-500">You blocked this seller. Their ads are hidden and you can&apos;t contact each other.</p>
      <button
        type="button"
        disabled={working}
        onClick={() =>
          startWorking(async () => {
            const result = await setBlocked(userId, false);
            if (result.ok) {
              toast.success("Seller unblocked");
              router.refresh();
            } else toast.error("Couldn't unblock this seller", result.error);
          })
        }
        className="text-sm font-semibold text-brand-700"
      >
        {working ? "Unblocking…" : "Unblock"}
      </button>
    </div>
  );
}
