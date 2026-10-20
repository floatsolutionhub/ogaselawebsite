import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { ChevronRight, Scale } from "lucide-react";

import { Container } from "@/components/Container";
import { EmptyState, SectionHeading } from "@/components/market/Badges";
import { cardClass } from "@/components/ui/styles";
import { settle } from "@/lib/api/client";
import { getMyDisputes } from "@/lib/api/services/deals";
import { requireUser } from "@/lib/auth/session";
import { safeHttpUrl, timeAgo } from "@/lib/format";
import { DISPUTE_REASON_LABELS, DISPUTE_STATUS } from "@/lib/statuses";

export const metadata: Metadata = { title: "Disputes", robots: { index: false } };

export default async function DisputesPage() {
  await requireUser("/disputes");
  const disputes = await settle(getMyDisputes());
  return (
    <Container className="max-w-3xl py-8 sm:py-12">
      <SectionHeading eyebrow="Fair trade" title="Disputes" />
      {!disputes ? (
        <EmptyState icon={Scale} title="We couldn't load your disputes">
          Please refresh the page in a moment.
        </EmptyState>
      ) : disputes.length === 0 ? (
        <EmptyState icon={Scale} title="No disputes">
          If a deal goes wrong, open a dispute from the ad or your chat with the other person.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {disputes.map((item) => {
            const status = DISPUTE_STATUS[item.status];
            const thumb = safeHttpUrl(item.listingThumbnailUrl);
            return (
              <li key={item.id}>
                <Link href={`/disputes/${item.id}`} className={`${cardClass} flex items-center gap-4 p-4 transition hover:shadow-lift`}>
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt="" referrerPolicy="no-referrer" className="size-14 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <span className="size-14 shrink-0 rounded-xl bg-brand-50" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{item.reference}</span>
                      <span className={clsx("rounded-full px-2 py-0.5 text-[11px] font-semibold", status.className)}>{status.label}</span>
                    </span>
                    <span className="block truncate text-sm text-ink-700">{item.listingTitle}</span>
                    <span className="block truncate text-xs text-ink-500">
                      {DISPUTE_REASON_LABELS[item.reason]} · {item.myRole === "Raiser" ? "against" : "raised by"} {item.otherPartyName} · {timeAgo(item.createdAt)}
                    </span>
                  </span>
                  <ChevronRight aria-hidden className="size-4 text-ink-300" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Container>
  );
}
