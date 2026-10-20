"use client";

import { useState, useTransition } from "react";
import { BadgeCheck, Clock, FileBadge, FileWarning, LoaderCircle, Receipt } from "lucide-react";

import { saveBusinessInfo, withdrawChange } from "@/app/actions/account";
import { ChangeRequestBanner } from "@/components/account/ChangeRequestBanner";
import { DocumentList } from "@/components/account/Documents";
import { useToast } from "@/components/providers/ToastProvider";
import { buttonClass, cardClass, inputClass } from "@/components/ui/styles";
import type { ProfileChange, UserDocument } from "@/lib/api/types";

/**
 * Seller business setup: name and store address (changes go to staff for approval), plus the
 * business registration document and proof of office address, which staff review.
 */
export function BusinessInfo({
  businessName,
  storeAddress,
  isBusinessVerified,
  change: initialChange,
  documents,
}: {
  businessName: string;
  storeAddress: string;
  isBusinessVerified: boolean;
  change?: ProfileChange;
  documents: UserDocument[];
}) {
  const toast = useToast();
  const [name, setName] = useState(businessName);
  const [address, setAddress] = useState(storeAddress);
  const [change, setChange] = useState(initialChange);
  const [submitting, startSubmitting] = useTransition();
  const [withdrawing, startWithdrawing] = useTransition();

  const hasUpload = (type: UserDocument["type"]) => {
    const latest = documents.find((d) => d.type === type);
    return !!latest && latest.status !== "Rejected";
  };
  const missing = [!hasUpload("BusinessRegistration") && "business registration", !hasUpload("OfficeUtilityBill") && "proof of office address"].filter(Boolean);
  const status = isBusinessVerified
    ? { Icon: BadgeCheck, text: "Business verified. Buyers see a verified business badge on your shop and ads.", gold: false }
    : missing.length > 0
      ? { Icon: FileWarning, text: `Awaiting ${missing.join(" and ")} upload`, gold: true }
      : { Icon: Clock, text: "Pending approval", gold: false };

  const dirty = name.trim() !== businessName || address.trim() !== storeAddress;
  // One change at a time: wait for the pending one to be reviewed (or withdraw it).
  const hasPending = change?.status === "PendingReview";

  return (
    <div className="space-y-6">
      <p className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium ring-1 ${status.gold ? "bg-gold-50 ring-gold-200" : "bg-brand-50 text-brand-800 ring-brand-100"}`}>
        <status.Icon aria-hidden className={`size-5 shrink-0 ${status.gold ? "text-gold-700" : "text-brand-600"}`} /> {status.text}
      </p>

      <ChangeRequestBanner
        change={change}
        pendingText={change ? `${change.businessName ?? ""}${change.storeAddress ? ` · ${change.storeAddress}` : " · no store address"}` : ""}
        withdrawing={withdrawing}
        onWithdraw={() =>
          startWithdrawing(async () => {
            if (!change) return;
            const result = await withdrawChange(change.id);
            if (result.ok) {
              setChange({ ...change, status: "Cancelled" });
              toast.success("Request withdrawn");
            } else toast.error("Couldn't withdraw the request", result.error);
          })
        }
      />

      <section className={`${cardClass} p-6`}>
        <h2 className="font-semibold">Business details</h2>
        <p className="mt-0.5 text-sm text-ink-500">Changes are reviewed by our team before they show on your shop.</p>
        <form
          className="mt-4 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            startSubmitting(async () => {
              const result = await saveBusinessInfo(name, address);
              if (result.ok) {
                setChange(result.data);
                setName(businessName);
                setAddress(storeAddress);
                toast.success("Sent for approval", "We'll notify you once it's reviewed.");
              } else toast.error("Couldn't submit your changes", result.error);
            });
          }}
        >
          <div>
            <label htmlFor="business-name" className="mb-1.5 block text-sm font-medium text-ink-700">
              Business name
            </label>
            <input id="business-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={200} autoComplete="organization" className={inputClass} />
          </div>
          <div>
            <label htmlFor="store-address" className="mb-1.5 block text-sm font-medium text-ink-700">
              Store / office address
            </label>
            <input
              id="store-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              maxLength={300}
              placeholder="Where buyers can find you (optional)"
              autoComplete="street-address"
              className={inputClass}
            />
          </div>
          <button type="submit" disabled={!dirty || name.trim().length < 2 || submitting || hasPending} className={buttonClass("primary", "lg", "w-full")}>
            {submitting && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
            {hasPending ? "Waiting for review" : "Submit for approval"}
          </button>
        </form>
      </section>

      <section className={`${cardClass} p-6`}>
        <h2 className="font-semibold">Business documents</h2>
        <p className="mt-0.5 text-sm text-ink-500">
          {isBusinessVerified
            ? "Verified. Tap a document to view it."
            : "Upload your registration document and proof of your office address. Our team reviews them."}
        </p>
        <DocumentList
          slots={[
            { type: "BusinessRegistration", title: "Business registration", icon: FileBadge },
            { type: "OfficeUtilityBill", title: "Proof of office address", icon: Receipt },
          ]}
          documents={documents}
          locked={isBusinessVerified}
          lockNote="Your business is verified, so this can no longer be changed."
        />
      </section>
    </div>
  );
}
