"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import clsx from "clsx";
import { Building2, Check, CreditCard, LoaderCircle, PackageCheck, ShieldCheck, Truck } from "lucide-react";

import { loadOfficePickup, startOfficePickup } from "@/app/actions/listings";
import { useShopLocation } from "@/components/providers/LocationProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Dialog } from "@/components/ui/Dialog";
import { buttonClass } from "@/components/ui/styles";
import { site } from "@/config/site";
import type { OfficeBranch, OfficePickupQuote } from "@/lib/api/types";
import { formatKobo } from "@/lib/format";

const STEPS = [
  { icon: CreditCard, title: "Pay through Ogasela", body: "You pay Ogasela the item price plus a 3% office pickup fee. We email you a receipt." },
  { icon: Building2, title: "The seller drops it at our office", body: "We ask the seller to bring the item to the Ogasela branch you choose below." },
  { icon: ShieldCheck, title: "We inspect it", body: "Our team checks the item matches the ad before it's handed over." },
  { icon: Truck, title: "Pick it up, or we deliver", body: "Walk in to collect it, or ask us to deliver it to your home." },
];

/** The app's office pickup sheet: how it works, the branch, the total, then the payment page. */
export function OfficePickupDialog({
  open,
  onClose,
  listingId,
  listingTitle,
}: {
  open: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
}) {
  const [paying, setPaying] = useState(false);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      dismissible={!paying}
      title="Request Office Pickup"
      description={<>Buy “{listingTitle}” safely through an Ogasela office.</>}
    >
      {/* Mounted only while open, so every opening starts fresh. */}
      <PickupBody listingId={listingId} onPayingChange={setPaying} />
    </Dialog>
  );
}

function PickupBody({ listingId, onPayingChange }: { listingId: string; onPayingChange: (paying: boolean) => void }) {
  const toast = useToast();
  const { coords } = useShopLocation();
  const [data, setData] = useState<{ quote: OfficePickupQuote; branches: OfficeBranch[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [paying, startPaying] = useTransition();

  useEffect(() => {
    let active = true;
    loadOfficePickup(listingId, coords).then((result) => {
      if (!active) return;
      if (result.ok) {
        setData(result.data);
        setBranchId(result.data.branches[0]?.id ?? null);
      } else setError(result.error);
    });
    return () => {
      active = false;
    };
  }, [listingId, coords]);

  useEffect(() => onPayingChange(paying), [paying, onPayingChange]);

  const quote = data?.quote;
  const canPay = !!quote?.available && !!branchId && !paying;

  const pay = () =>
    startPaying(async () => {
      if (!branchId) return;
      const result = await startOfficePickup(listingId, branchId);
      if (result.ok) window.location.assign(result.data);
      else toast.error("Couldn't start office pickup", result.error);
    });

  if (error) return <p className="py-8 text-center text-sm text-ink-500">{error}</p>;
  if (!data || !quote) {
    return (
      <div className="flex justify-center py-10">
        <LoaderCircle aria-hidden className="size-6 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ol className="space-y-3">
        {STEPS.map(({ icon: Icon, title, body }, index) => (
          <li key={title} className="flex gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
              <Icon aria-hidden className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">
                {index + 1}. {title}
              </p>
              <p className="text-sm text-ink-500">{body}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="rounded-2xl bg-gold-50 px-4 py-3 text-sm text-ink-700">
        If the item fails inspection, or you decide not to go ahead, you&apos;re refunded everything except a {quote.cancellationFeePercent}% processing
        and cancellation fee ({formatKobo(quote.cancellationFeeKobo)}).{" "}
        <a href={site.links.terms} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 underline-offset-2 hover:underline">
          See the Terms of Service
        </a>
      </p>

      {!quote.available ? (
        <p className="text-center text-sm text-ink-500">Office pickup isn&apos;t available for this ad.</p>
      ) : (
        <>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Pickup branch</legend>
            {data.branches.length === 0 ? (
              <p className="text-sm text-ink-500">No branches are open for office pickup right now. Please check back soon.</p>
            ) : (
              <div className="space-y-2">
                {data.branches.map((branch) => (
                  <label
                    key={branch.id}
                    className={clsx(
                      "flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-3.5 transition",
                      branch.id === branchId ? "border-brand-600 bg-brand-50" : "border-canvas-dark/60 hover:border-brand-200",
                    )}
                  >
                    <input type="radio" name="branch" value={branch.id} checked={branch.id === branchId} onChange={() => setBranchId(branch.id)} className="sr-only" />
                    <span className="flex-1">
                      <span className="block text-sm font-semibold">
                        {branch.name}
                        {branch.distanceKm !== null && <span className="ml-2 font-normal text-ink-500">{branch.distanceKm} km away</span>}
                      </span>
                      <span className="block text-sm text-ink-500">{branch.address}</span>
                      {branch.openingHours && <span className="block text-xs text-ink-300">{branch.openingHours}</span>}
                    </span>
                    {branch.id === branchId && <Check aria-hidden className="size-4 text-brand-600" />}
                  </label>
                ))}
              </div>
            )}
          </fieldset>
          <dl className="space-y-1.5 rounded-2xl bg-surface px-4 py-3 text-sm ring-1 ring-canvas-dark/60">
            <div className="flex justify-between">
              <dt className="text-ink-700">Item price</dt>
              <dd>{formatKobo(quote.itemPriceKobo)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-700">Office pickup fee ({quote.serviceFeePercent}%)</dt>
              <dd>{formatKobo(quote.serviceFeeKobo)}</dd>
            </div>
            <div className="flex justify-between border-t border-canvas-dark/60 pt-1.5 font-semibold">
              <dt>Total</dt>
              <dd>{formatKobo(quote.totalKobo)}</dd>
            </div>
          </dl>
          <p className="text-xs text-ink-500">
            You&apos;ll pay on our payment partner&apos;s secure page and come straight back here.{" "}
            <Link href="/office-pickups" className="font-semibold text-brand-700">
              Your office pickups
            </Link>
          </p>
        </>
      )}
      <button type="button" onClick={pay} disabled={!canPay} className={buttonClass("primary", "lg", "w-full")}>
        {paying ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : <PackageCheck aria-hidden className="size-4" />}
        {paying ? "Starting payment…" : "Continue to payment"}
      </button>
    </div>
  );
}
