"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";

import { cancelPickup, checkPickupPayment } from "@/app/actions/deals";
import { useToast } from "@/components/providers/ToastProvider";
import { Dialog } from "@/components/ui/Dialog";
import { buttonClass, inputClass } from "@/components/ui/styles";
import { formatKobo } from "@/lib/format";

export function PickupActions({
  id,
  canCheckPayment,
  canCancel,
  totalKobo,
  itemPriceKobo,
}: {
  id: string;
  canCheckPayment: boolean;
  canCancel: boolean;
  totalKobo: number;
  itemPriceKobo: number;
}) {
  const router = useRouter();
  const toast = useToast();
  const [checking, startChecking] = useTransition();
  const [cancelling, startCancelling] = useTransition();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const fee = Math.round(itemPriceKobo * 0.01);

  if (!canCheckPayment && !canCancel) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {canCheckPayment && (
        <button
          type="button"
          disabled={checking}
          onClick={() =>
            startChecking(async () => {
              const result = await checkPickupPayment(id);
              if (!result.ok) toast.error("Couldn't check the payment", result.error);
              else if (result.data.summary.status === "AwaitingPayment") toast.info("Still waiting for your bank", "We'll notify you once it's confirmed.");
              router.refresh();
            })
          }
          className={buttonClass("primary", "md")}
        >
          {checking && <LoaderCircle aria-hidden className="size-4 animate-spin" />} Check payment
        </button>
      )}
      {canCancel && (
        <button type="button" onClick={() => setOpen(true)} className={buttonClass("danger", "md")}>
          Cancel and request a refund
        </button>
      )}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        dismissible={!cancelling}
        size="sm"
        title="Cancel office pickup"
        description={`You'll be refunded ${formatKobo(totalKobo - fee)}: everything you paid except the 1% processing and cancellation fee (${formatKobo(fee)}).`}
        footer={
          <button
            type="button"
            disabled={!reason.trim() || cancelling}
            onClick={() =>
              startCancelling(async () => {
                const result = await cancelPickup(id, reason);
                if (result.ok) {
                  setOpen(false);
                  toast.success("Cancellation requested", "Our team will process your refund.");
                  router.refresh();
                } else toast.error("Couldn't request cancellation", result.error);
              })
            }
            className={buttonClass("danger", "lg", "w-full")}
          >
            {cancelling && <LoaderCircle aria-hidden className="size-4 animate-spin" />} Request cancellation
          </button>
        }
      >
        <label htmlFor="cancel-reason" className="sr-only">
          Why are you cancelling?
        </label>
        <textarea
          id="cancel-reason"
          rows={4}
          maxLength={1000}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Why are you cancelling?"
          className={inputClass}
        />
      </Dialog>
    </div>
  );
}
