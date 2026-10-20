"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import clsx from "clsx";
import { Check, Clock, CreditCard, ImageOff, LoaderCircle } from "lucide-react";

import { settleCheckout, startCheckout } from "@/app/actions/sell";
import { useToast } from "@/components/providers/ToastProvider";
import { buttonClass } from "@/components/ui/styles";
import type { PromotionPlan } from "@/lib/api/types";
import { formatKobo } from "@/lib/format";

export function PlanPicker({
  listingId,
  plans,
  initialPlanId,
  photoCount,
  reviewNote,
  paymentPending,
}: {
  listingId: string;
  plans: PromotionPlan[];
  initialPlanId: string | null;
  photoCount: number;
  reviewNote: string | null;
  /** A card payment for this ad that the bank hasn't confirmed yet. */
  paymentPending: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [selectedId, setSelectedId] = useState(plans.some((p) => p.id === initialPlanId) ? initialPlanId : plans[0]?.id ?? null);
  const [pending, setPending] = useState(paymentPending);
  const [paying, startPaying] = useTransition();
  const [checking, startChecking] = useTransition();

  const selected = plans.find((p) => p.id === selectedId) ?? null;
  const isFree = selected?.price === 0;
  const photosDropped = selected && selected.photoLimit > 0 ? Math.max(0, photoCount - selected.photoLimit) : 0;

  const pay = () =>
    startPaying(async () => {
      if (!selected) return;
      const result = await startCheckout(listingId, selected.id);
      if (!result.ok) {
        toast.error("Couldn't complete checkout", result.error);
        return;
      }
      if (result.data.kind === "redirect") {
        // To the payment partner's page; it sends the payer back to /payments/return.
        window.location.assign(result.data.url);
        return;
      }
      toast.success(
        result.data.underReview ? "Submitted! Your ad is under review" : "Your ad is live",
        result.data.underReview ? "We'll let you know as soon as our team approves it." : undefined,
      );
      router.push(`/my-ads?tab=${result.data.underReview ? "pending" : "active"}`);
    });

  const checkAgain = () =>
    startChecking(async () => {
      const result = await settleCheckout("confirm");
      if (!result.ok) {
        toast.error("Couldn't check your payment", result.error);
        return;
      }
      const outcome = result.data;
      if (outcome.status === "paid") {
        toast.success(outcome.title, outcome.body);
        router.push(outcome.next);
      } else if (outcome.status === "failed" || outcome.status === "cancelled") {
        setPending(false);
        toast.info(outcome.title, outcome.body);
      } else if (outcome.status === "none") {
        setPending(false);
      } else {
        toast.info("Still waiting for your bank", "We'll submit your ad automatically once it confirms.");
      }
    });

  return (
    <div className="mt-8 space-y-6">
      {pending && (
        <div className="flex gap-3 rounded-2xl bg-gold-50 p-4 ring-1 ring-gold-200">
          <Clock aria-hidden className="mt-0.5 size-5 shrink-0 text-gold-700" />
          <div className="text-sm">
            <p className="font-semibold text-gold-800">Confirming your payment</p>
            <p className="mt-0.5 text-ink-700">
              Your bank hasn&apos;t confirmed it yet. We&apos;ll submit your ad for review automatically once it does. You don&apos;t need to pay again.
            </p>
            <button type="button" onClick={checkAgain} disabled={checking} className="mt-2 font-semibold text-brand-700">
              {checking ? "Checking…" : "Check again"}
            </button>
          </div>
        </div>
      )}

      {reviewNote && (
        <div className="rounded-2xl bg-danger/5 p-4 text-sm ring-1 ring-danger/20">
          <p className="font-semibold text-danger">Last submission wasn&apos;t approved</p>
          <p className="mt-0.5 text-ink-700">{reviewNote}</p>
        </div>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">1. Choose a promotion plan</h2>
        <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
          {plans.map((plan) => {
            const active = plan.id === selectedId;
            return (
              <button
                key={plan.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSelectedId(plan.id)}
                className={clsx(
                  "relative overflow-hidden rounded-3xl border-2 bg-white p-5 text-left transition",
                  active ? "border-brand-600 shadow-lift" : "border-canvas-dark/60 hover:border-brand-300",
                )}
              >
                {active && <span aria-hidden className="awning-sm absolute inset-x-0 top-0 h-2.5" />}
                <span className="flex items-start gap-3">
                  <span className="flex-1">
                    <span className="block text-lg font-semibold">{plan.name}</span>
                    {plan.description && <span className="mt-0.5 block text-sm text-ink-500">{plan.description}</span>}
                  </span>
                  <span
                    className={clsx(
                      "grid size-6 shrink-0 place-items-center rounded-full border-2",
                      active ? "border-brand-600 bg-brand-600 text-white" : "border-ink-300",
                    )}
                  >
                    {active && <Check aria-hidden className="size-3.5" strokeWidth={3} />}
                  </span>
                </span>
                <span className="mt-3 block text-2xl font-extrabold">
                  {plan.price === 0 ? "Free" : formatKobo(plan.price)}
                  <span className="text-sm font-normal text-ink-500"> · {plan.durationDays} days</span>
                </span>
                {plan.photoLimit > 0 && photoCount > plan.photoLimit && (
                  <span className="mt-3 flex items-start gap-2 rounded-xl bg-gold-50 px-3 py-2 text-xs text-gold-800">
                    <ImageOff aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                    Shows {plan.photoLimit} of your {photoCount} photos. We&apos;ll keep your first {plan.photoLimit}.
                  </span>
                )}
                {plan.features.length > 0 ? (
                  <span className="mt-3 block space-y-1.5">
                    {plan.features.map((feature) => (
                      <span key={feature} className="flex items-start gap-2 text-sm text-ink-700">
                        <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-600" /> {feature}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="mt-2 block text-sm text-ink-500">
                    Up to {plan.photoLimit} photos{plan.videoAllowed ? " and a video" : ""}.
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {selected && !isFree && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">2. How would you like to pay?</h2>
          <div className="flex items-center gap-3 rounded-2xl border-2 border-brand-600 bg-white px-4 py-3.5">
            <span className="grid size-10 place-items-center rounded-full bg-brand-50 text-brand-600">
              <CreditCard aria-hidden className="size-5" />
            </span>
            <span className="flex-1">
              <span className="block font-semibold">Card, bank transfer or USSD</span>
              <span className="text-sm text-ink-500">Pay securely on our payment partner&apos;s page, then come straight back here</span>
            </span>
            <Check aria-hidden className="size-5 text-brand-600" />
          </div>
        </section>
      )}

      {photosDropped > 0 && selected && (
        <p className="flex gap-3 rounded-2xl bg-gold-50 p-4 text-sm text-ink-700 ring-1 ring-gold-200">
          <ImageOff aria-hidden className="mt-0.5 size-5 shrink-0 text-gold-700" />
          The {selected.name} plan includes up to {selected.photoLimit} photos, so your last {photosDropped} {photosDropped === 1 ? "photo" : "photos"} will
          be left off when your ad is submitted. Choose a bigger plan to keep them all, or edit your draft and remove the ones you can do without.
        </p>
      )}

      <p className="text-sm text-ink-500">
        Once {isFree ? "submitted" : "your payment is confirmed"}, your ad goes to our team for a quick review before buyers can see it.
      </p>

      <div className="sticky bottom-16 z-10 space-y-2 rounded-2xl bg-surface/90 py-3 backdrop-blur sm:bottom-0">
        <button type="button" onClick={pay} disabled={!selected || paying || pending} className={buttonClass("primary", "lg", "w-full")}>
          {paying && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
          {!selected ? "Choose a plan" : paying ? (isFree ? "Submitting your ad…" : "Starting payment…") : isFree ? "Submit for review (free)" : `Pay ${formatKobo(selected.price)}`}
        </button>
        <Link href={`/sell?draft=${listingId}`} className="block py-1 text-center text-sm font-medium text-ink-500 hover:text-ink-700">
          Edit the ad
        </Link>
        <Link href="/my-ads?tab=draft" className="block py-1 text-center text-sm font-medium text-ink-500 hover:text-ink-700">
          Save as draft for now
        </Link>
      </div>
    </div>
  );
}
