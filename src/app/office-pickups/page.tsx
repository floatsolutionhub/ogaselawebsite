import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { ChevronRight, PackageCheck } from "lucide-react";

import { Container } from "@/components/Container";
import { EmptyState, SectionHeading } from "@/components/market/Badges";
import { cardClass } from "@/components/ui/styles";
import { settle } from "@/lib/api/client";
import { getMyPickups } from "@/lib/api/services/deals";
import { requireUser } from "@/lib/auth/session";
import { formatKobo, safeHttpUrl, timeAgo } from "@/lib/format";
import { PICKUP_STATUS } from "@/lib/statuses";

export const metadata: Metadata = { title: "Office pickups", robots: { index: false } };

export default async function OfficePickupsPage() {
  await requireUser("/office-pickups");
  const requests = await settle(getMyPickups());
  return (
    <Container className="max-w-3xl py-8 sm:py-12">
      <SectionHeading eyebrow="Buy safely" title="Office pickups" />
      {!requests ? (
        <EmptyState icon={PackageCheck} title="We couldn't load your office pickups">
          Please refresh the page in a moment.
        </EmptyState>
      ) : requests.length === 0 ? (
        <EmptyState icon={PackageCheck} title="No office pickups yet">
          Tap “Request Office Pickup” on an ad to buy it safely through one of our offices.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {requests.map((item) => {
            const status = PICKUP_STATUS[item.status];
            const thumb = safeHttpUrl(item.listingThumbnailUrl);
            return (
              <li key={item.id}>
                <Link href={`/office-pickups/${item.id}`} className={`${cardClass} flex items-center gap-4 p-4 transition hover:shadow-lift`}>
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
                      {item.myRole === "Buyer" ? `You're buying · ${formatKobo(item.totalKobo)}` : "You're selling"} · {item.branchName} · {timeAgo(item.createdAt)}
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
