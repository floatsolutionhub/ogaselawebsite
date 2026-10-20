"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";

import { deleteAd } from "@/app/actions/sell";
import { useToast } from "@/components/providers/ToastProvider";
import { Dialog } from "@/components/ui/Dialog";
import { buttonClass } from "@/components/ui/styles";

/**
 * Deletes a draft, rejected, pending or expired ad after a confirmation. When the seller paid for
 * a plan that hasn't been used up, the dialog says plainly that deleting doesn't refund it.
 */
export function DeleteAdButton({ listingId, title, paidPlan }: { listingId: string; title: string; paidPlan: string | null }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [deleting, startDeleting] = useTransition();

  const confirm = () =>
    startDeleting(async () => {
      const result = await deleteAd(listingId);
      if (!result.ok) {
        toast.error("Couldn't delete your ad", result.error);
        return;
      }
      setOpen(false);
      toast.success("Ad deleted");
      router.refresh();
    });

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={`Delete “${title}”`} className={buttonClass("danger", "sm")}>
        <Trash2 aria-hidden className="size-4" /> Delete
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        dismissible={!deleting}
        size="sm"
        title="Delete this ad?"
        description={`“${title}” will be removed from My ads for good. This can't be undone.`}
        footer={
          <div className="flex gap-2">
            <button type="button" onClick={() => setOpen(false)} disabled={deleting} className={buttonClass("outline", "md", "flex-1")}>
              Keep it
            </button>
            <button type="button" onClick={confirm} disabled={deleting} className={buttonClass("danger", "md", "flex-1")}>
              {deleting && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
              Delete ad
            </button>
          </div>
        }
      >
        {paidPlan && (
          <p className="rounded-xl bg-danger/5 p-3 text-sm text-ink-700 ring-1 ring-danger/20">
            <strong className="font-semibold text-danger">No refund. </strong>
            You paid for the {paidPlan} plan on this ad. Deleting the ad doesn&apos;t refund it.
          </p>
        )}
      </Dialog>
    </>
  );
}
