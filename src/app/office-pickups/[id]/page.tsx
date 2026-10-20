import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { ChevronLeft, Clock, MapPin, Navigation, Phone } from "lucide-react";

import { Container } from "@/components/Container";
import { cardClass } from "@/components/ui/styles";
import { ApiError } from "@/lib/api/client";
import { getPickup } from "@/lib/api/services/deals";
import type { OfficePickupDetail, OfficePickupStatus } from "@/lib/api/types";
import { requireUser } from "@/lib/auth/session";
import { dateTime, formatKobo, safeHttpUrl, shortDate } from "@/lib/format";
import { PICKUP_STATUS } from "@/lib/statuses";
import { uuidSchema } from "@/lib/validation";
import { PickupActions } from "./PickupActions";

export const metadata: Metadata = { title: "Office pickup", robots: { index: false } };

const STAGES: { status: OfficePickupStatus; label: string }[] = [
  { status: "PaymentConfirmed", label: "Payment confirmed" },
  { status: "ItemReceived", label: "Item delivered to our office" },
  { status: "InspectionPassed", label: "Passed quality inspection" },
  { status: "ReadyForCollection", label: "Available for pickup or delivery" },
  { status: "Completed", label: "Completed" },
];

const STAGE_INDEX: Partial<Record<OfficePickupStatus, number>> = {
  PaymentConfirmed: 0,
  ItemReceived: 1,
  InspectionPassed: 2,
  ReadyForCollection: 3,
  OutForDelivery: 3,
  Completed: 4,
};

/** What the reader should do or expect now - the app's wording. */
function nextStep(detail: OfficePickupDetail): string {
  const { summary, branch } = detail;
  const buyer = summary.myRole === "Buyer";
  switch (summary.status) {
    case "AwaitingPayment":
      return buyer ? "We're waiting for your bank to confirm the payment. This usually takes a minute." : "The buyer hasn't completed payment yet.";
    case "PaymentFailed":
      return "The payment didn't go through, so nothing was charged.";
    case "PaymentCancelled":
      return "The payment was cancelled, so nothing was charged. You can request office pickup again from the ad.";
    case "PaymentConfirmed":
      return buyer
        ? `We've asked the seller to drop the item at our ${branch.name} office. We'll let you know when it arrives.`
        : `The buyer has paid. Please drop the item at our ${branch.name} office (${branch.address}) and quote ${summary.reference}.`;
    case "ItemReceived":
      return "The item is at our office and our team is inspecting it.";
    case "InspectionPassed":
      return "The item passed our quality inspection. It'll be ready for you shortly.";
    case "InspectionFailed":
      return buyer
        ? "The item didn't pass inspection. We'll refund you, less the 1% cancellation fee."
        : `The item didn't pass inspection. Please collect it from our ${branch.name} office.`;
    case "ReadyForCollection":
      return buyer
        ? `Your item is ready. Collect it at our ${branch.name} office and quote ${summary.reference}, or contact us to have it delivered.`
        : "The item is ready for the buyer to collect.";
    case "OutForDelivery":
      return `The item is on its way to ${detail.deliveryAddress ?? "the buyer"}.`;
    case "Completed":
      return buyer ? "You've received your item. Enjoy!" : "The buyer has received the item.";
    case "Refunded":
      return buyer
        ? `We refunded ${formatKobo(detail.refundedKobo ?? 0)} to your payment method. It can take a few working days to show.`
        : "This office pickup was cancelled and the buyer was refunded.";
  }
}

export default async function OfficePickupPage({ params }: PageProps<"/office-pickups/[id]">) {
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();
  await requireUser(`/office-pickups/${id}`);
  let detail: OfficePickupDetail;
  try {
    detail = await getPickup(id);
  } catch (error) {
    if (error instanceof ApiError && error.status < 500) notFound();
    throw error;
  }

  const { summary, branch } = detail;
  const status = PICKUP_STATUS[summary.status];
  const isBuyer = summary.myRole === "Buyer";
  const inProgress = ["PaymentConfirmed", "ItemReceived", "InspectionPassed", "InspectionFailed", "ReadyForCollection"].includes(summary.status);
  const stageIndex = STAGE_INDEX[summary.status];
  const thumb = safeHttpUrl(summary.listingThumbnailUrl);
  const branchPhone = branch.phone?.replace(/[^\d+]/g, "");

  return (
    <Container className="max-w-3xl py-8 sm:py-12">
      <Link href="/office-pickups" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
        <ChevronLeft aria-hidden className="size-4" /> Office pickups
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{summary.reference}</h1>
        <span className={clsx("rounded-full px-3 py-1 text-xs font-semibold", status.className)}>{status.label}</span>
      </div>

      <div className="mt-6 space-y-4">
        <Link href={`/listing/${summary.listingId}`} className={`${cardClass} flex items-center gap-4 p-4`}>
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt="" referrerPolicy="no-referrer" className="size-14 rounded-xl object-cover" />
          ) : (
            <span className="size-14 rounded-xl bg-brand-50" />
          )}
          <span className="min-w-0">
            <span className="line-clamp-2 font-semibold">{summary.listingTitle}</span>
            <span className="text-sm text-ink-500">
              {isBuyer ? "You're buying" : "You're selling"} · requested {shortDate(summary.createdAt)}
            </span>
          </span>
        </Link>

        <section className="rounded-3xl bg-brand-50 p-5 ring-1 ring-brand-100">
          <h2 className="font-semibold text-brand-800">What&apos;s next</h2>
          <p className="mt-1 leading-7 text-ink-700">{nextStep(detail)}</p>
          {summary.cancellationRequested && summary.status !== "Refunded" && (
            <p className="mt-2 text-sm text-ink-500">
              {isBuyer ? "You've asked to cancel. Our team will process your refund shortly." : "The buyer has asked to cancel."}
            </p>
          )}
          <PickupActions
            id={summary.id}
            canCheckPayment={isBuyer && summary.status === "AwaitingPayment"}
            canCancel={isBuyer && inProgress && !summary.cancellationRequested}
            totalKobo={summary.totalKobo}
            itemPriceKobo={detail.itemPriceKobo}
          />
        </section>

        {stageIndex !== undefined && (
          <section className={`${cardClass} p-5`}>
            <h2 className="mb-4 font-semibold">Progress</h2>
            <ol>
              {STAGES.map((stage, index) => {
                const done = index <= stageIndex;
                return (
                  <li key={stage.status} className="flex gap-3">
                    <span className="flex flex-col items-center">
                      <span className={clsx("size-3.5 rounded-full", done ? "bg-brand-600" : "bg-brand-100")} />
                      {index < STAGES.length - 1 && <span className={clsx("min-h-6 w-0.5 flex-1", index < stageIndex ? "bg-brand-600" : "bg-brand-100")} />}
                    </span>
                    <span className={clsx("-mt-1 pb-4 text-sm", done ? "font-semibold text-ink-900" : "text-ink-500")}>
                      {stage.status === "ReadyForCollection" && summary.status === "OutForDelivery" ? "Out for delivery" : stage.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        <section className={`${cardClass} p-5`}>
          <h2 className="font-semibold">Ogasela {branch.name} office</h2>
          <p className="mt-2 flex gap-2 text-ink-700">
            <MapPin aria-hidden className="mt-1 size-4 shrink-0 text-ink-500" /> {branch.address}
          </p>
          {branch.openingHours && (
            <p className="mt-1.5 flex items-center gap-2 text-ink-700">
              <Clock aria-hidden className="size-4 text-ink-500" /> {branch.openingHours}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${branch.latitude},${branch.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700"
            >
              <Navigation aria-hidden className="size-4" /> Directions
            </a>
            {branchPhone && (
              <a href={`tel:${branchPhone}`} className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
                <Phone aria-hidden className="size-4" /> Call branch
              </a>
            )}
          </div>
        </section>

        {isBuyer && (
          <section className={`${cardClass} p-5`}>
            <h2 className="mb-3 font-semibold">Payment</h2>
            <dl className="space-y-1.5 text-sm">
              <Row label="Item price" value={formatKobo(detail.itemPriceKobo)} />
              <Row label="Office pickup fee (3%)" value={formatKobo(detail.serviceFeeKobo)} />
              <Row label="Total paid" value={formatKobo(summary.totalKobo)} bold />
              {detail.refundedKobo !== null && (
                <>
                  <Row label="Cancellation fee (1%)" value={`- ${formatKobo(detail.cancellationFeeKobo ?? 0)}`} />
                  <Row label="Refunded" value={formatKobo(detail.refundedKobo)} bold />
                </>
              )}
            </dl>
            {detail.paidAt && <p className="mt-2 text-xs text-ink-500">Paid {dateTime(detail.paidAt)} · receipt sent to your email</p>}
          </section>
        )}

        <section className={`${cardClass} p-5`}>
          <h2 className="mb-3 font-semibold">Activity</h2>
          {detail.activities.length === 0 ? (
            <p className="text-sm text-ink-500">Nothing yet.</p>
          ) : (
            <ul className="space-y-3">
              {detail.activities.map((activity, index) => (
                <li key={`${activity.createdAt}-${index}`} className="flex gap-3">
                  <span className={clsx("mt-2 size-2 shrink-0 rounded-full", index === 0 ? "bg-brand-600" : "bg-ink-300")} />
                  <span>
                    <span className="block font-medium">{activity.title}</span>
                    {activity.note && <span className="block text-sm text-ink-700">{activity.note}</span>}
                    <span className="text-xs text-ink-300">{dateTime(activity.createdAt)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Container>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={clsx("flex justify-between", bold && "font-semibold")}>
      <dt className={bold ? undefined : "text-ink-700"}>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
