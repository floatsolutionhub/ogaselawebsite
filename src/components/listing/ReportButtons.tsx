"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import clsx from "clsx";
import { Flag, LoaderCircle, UserX } from "lucide-react";

import { reportAd, reportSeller } from "@/app/actions/listings";
import { useViewer } from "@/components/providers/SessionProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Dialog } from "@/components/ui/Dialog";
import { buttonClass } from "@/components/ui/styles";

const AD_REASONS = [
  "Scam or fraud",
  "Prohibited or illegal item",
  "Wrong category",
  "Item already sold",
  "Misleading price or description",
  "Duplicate ad",
  "Other",
];

const SELLER_REASONS = [
  "Scammer or fraudulent seller",
  "Asked for payment outside Ogasela",
  "Abusive or offensive behaviour",
  "Fake business or identity",
  "Didn't deliver after payment",
  "Other",
];

/** "Report Ad" and "Report Seller" - reports are private and go to moderators. */
export function ReportButtons({ listingId, sellerUserId, sellerName }: { listingId: string; sellerUserId: string; sellerName: string }) {
  const viewer = useViewer();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const [target, setTarget] = useState<"ad" | "seller" | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [sending, startSending] = useTransition();

  const open = (which: "ad" | "seller") => {
    if (!viewer) {
      router.push(`/sign-in?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setReason(null);
    setTarget(which);
  };

  const submit = () =>
    startSending(async () => {
      if (!reason || !target) return;
      const result = target === "ad" ? await reportAd(listingId, reason) : await reportSeller(sellerUserId, reason);
      if (result.ok) {
        setTarget(null);
        toast.success("Report sent", "Thanks. Our moderators will review it.");
      } else toast.error("Couldn't send your report", result.error);
    });

  const reasons = target === "seller" ? SELLER_REASONS : AD_REASONS;
  const button = "inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-danger/25 bg-white text-sm font-semibold text-danger transition hover:bg-danger/5";

  return (
    <>
      <div className="flex gap-2">
        <button type="button" onClick={() => open("ad")} className={button}>
          <Flag aria-hidden className="size-4" /> Report Ad
        </button>
        <button type="button" onClick={() => open("seller")} className={button}>
          <UserX aria-hidden className="size-4" /> Report Seller
        </button>
      </div>
      <Dialog
        open={target !== null}
        onClose={() => setTarget(null)}
        dismissible={!sending}
        size="sm"
        title={target === "seller" ? "Report seller" : "Report ad"}
        description={
          target === "seller"
            ? `Tell us what's wrong with ${sellerName}. Reports are private.`
            : "Tell us what's wrong with this ad. The seller won't see who reported it."
        }
        footer={
          <button type="button" onClick={submit} disabled={!reason || sending} className={buttonClass("danger", "lg", "w-full")}>
            {sending && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
            Send report
          </button>
        }
      >
        <div role="radiogroup" className="grid gap-2">
          {reasons.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={reason === option}
              onClick={() => setReason(option)}
              className={clsx(
                "rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition",
                reason === option ? "border-danger bg-danger/5 text-danger" : "border-canvas-dark/60 hover:border-danger/30",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </Dialog>
    </>
  );
}
