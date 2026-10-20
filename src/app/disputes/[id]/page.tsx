import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { ChevronLeft, Scale, ShieldCheck } from "lucide-react";

import { Container } from "@/components/Container";
import { cardClass } from "@/components/ui/styles";
import { ApiError } from "@/lib/api/client";
import { getDispute } from "@/lib/api/services/deals";
import type { DisputeDetail } from "@/lib/api/types";
import { requireUser } from "@/lib/auth/session";
import { dateTime, safeHttpUrl, shortDate } from "@/lib/format";
import { DISPUTE_REASON_LABELS, DISPUTE_STATUS, outcomeText } from "@/lib/statuses";
import { uuidSchema } from "@/lib/validation";
import { DisputeThread, Evidence } from "./DisputeThread";

export const metadata: Metadata = { title: "Dispute", robots: { index: false } };

export default async function DisputePage({ params }: PageProps<"/disputes/[id]">) {
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();
  await requireUser(`/disputes/${id}`);
  let dispute: DisputeDetail;
  try {
    dispute = await getDispute(id);
  } catch (error) {
    if (error instanceof ApiError && error.status < 500) notFound();
    throw error;
  }

  const { summary } = dispute;
  const status = DISPUTE_STATUS[summary.status];
  const resolved = summary.status === "Resolved";
  const thumb = safeHttpUrl(summary.listingThumbnailUrl);

  return (
    <Container className="max-w-3xl py-8 sm:py-12">
      <Link href="/disputes" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
        <ChevronLeft aria-hidden className="size-4" /> Disputes
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{summary.reference}</h1>
        <span className={clsx("rounded-full px-3 py-1 text-xs font-semibold", status.className)}>{status.label}</span>
      </div>

      <div className="mt-6 space-y-4">
        {resolved ? (
          <section className="rounded-3xl bg-brand-50 p-5 ring-1 ring-brand-100">
            <p className="flex items-center gap-2 font-semibold text-brand-700">
              <ShieldCheck aria-hidden className="size-5" /> {outcomeText(summary.outcome, summary.myRole)}
            </p>
            {dispute.resolutionNote && <p className="mt-2 text-ink-700">{dispute.resolutionNote}</p>}
            {dispute.resolvedAt && <p className="mt-2 text-xs text-ink-500">{dateTime(dispute.resolvedAt)}</p>}
          </section>
        ) : (
          <p className="flex gap-3 rounded-3xl bg-gold-50 p-4 text-sm text-ink-700 ring-1 ring-gold-200">
            <Scale aria-hidden className="mt-0.5 size-5 shrink-0 text-gold-700" />
            {summary.status === "Open"
              ? "Our team will pick this up shortly. Add anything that helps. Both of you can reply here."
              : "Our team is reviewing this dispute. Reply here with anything they ask for."}
          </p>
        )}

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
              {summary.myRole === "Raiser" ? "You opened this against" : "Opened by"} {summary.otherPartyName}
            </span>
          </span>
        </Link>

        <section className={`${cardClass} p-5`}>
          <h2 className="font-semibold">{DISPUTE_REASON_LABELS[summary.reason]}</h2>
          <p className="mt-0.5 text-xs text-ink-500">
            {summary.myRole === "Raiser" ? "You" : summary.otherPartyName} · {shortDate(summary.createdAt)}
          </p>
          <p className="mt-3 whitespace-pre-line break-words text-ink-700">{dispute.description}</p>
          {dispute.evidence.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {dispute.evidence.map((e) => (
                <Evidence key={e.url} evidence={e} />
              ))}
            </div>
          )}
        </section>

        <DisputeThread disputeId={summary.id} myRole={summary.myRole} resolved={resolved} initial={dispute.messages} />
      </div>
    </Container>
  );
}
