import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { CircleAlert, Clock, ImageOff, Megaphone, Pencil, Plus, Rocket } from "lucide-react";

import { Container } from "@/components/Container";
import { EmptyState, SectionHeading } from "@/components/market/Badges";
import { buttonClass, cardClass } from "@/components/ui/styles";
import { settle } from "@/lib/api/client";
import { getSellerListings } from "@/lib/api/marketplace";
import type { Listing, ListingStatus } from "@/lib/api/types";
import { requireUser } from "@/lib/auth/session";
import { formatNaira, safeHttpUrl, shortDate, timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "My ads", robots: { index: false } };

type TabKey = "active" | "draft" | "pending" | "expired";

const TABS: { key: TabKey; label: string; statuses: ListingStatus[]; empty: string }[] = [
  { key: "active", label: "Active", statuses: ["Active", "ExpiringSoon"], empty: "You have no live ads. Approved ads show up here." },
  { key: "draft", label: "Draft", statuses: ["Draft"], empty: "No drafts. Ads you started but haven't paid for show up here." },
  { key: "pending", label: "Pending", statuses: ["PendingReview"], empty: "Nothing waiting for approval. Published ads wait here until our team approves them." },
  { key: "expired", label: "Expired", statuses: ["Expired"], empty: "No expired ads." },
];

/** A seller rarely has more than a few dozen ads; one page covers them and keeps the tab counts exact. */
const PAGE_SIZE = 100;

function statusLine(listing: Listing): string {
  switch (listing.status) {
    case "Active":
    case "ExpiringSoon":
      return listing.expiresAt ? `Expires ${timeAgo(listing.expiresAt)}` : "Live";
    case "PendingReview":
      return `Submitted ${timeAgo(listing.updatedAt)} · waiting for approval`;
    case "Expired":
      return listing.expiresAt ? `Expired ${shortDate(listing.expiresAt)}` : "Expired";
    default:
      return `Last edited ${timeAgo(listing.updatedAt)}`;
  }
}

export default async function MyAdsPage({ searchParams }: PageProps<"/my-ads">) {
  const user = await requireUser("/my-ads");
  const requested = (await searchParams).tab;
  const active = TABS.find((t) => t.key === requested) ?? TABS[0];
  const sellerId = user.sellerProfile?.id;
  const page = sellerId ? await settle(getSellerListings(sellerId, 1, PAGE_SIZE)) : null;
  const listings = page?.items ?? [];
  const visible = listings.filter((l) => active.statuses.includes(l.status));

  return (
    <Container className="max-w-4xl py-8 sm:py-12">
      <SectionHeading
        eyebrow="Your stall"
        title="My ads"
        action={
          <Link href="/sell" className={buttonClass("gold", "sm")}>
            <Plus aria-hidden className="size-4" /> Post an ad
          </Link>
        }
      />

      <nav aria-label="Ad status" className="mb-6 grid grid-cols-4 gap-1 rounded-2xl bg-white p-1 shadow-card ring-1 ring-canvas-dark/60">
        {TABS.map((tab) => {
          const count = listings.filter((l) => tab.statuses.includes(l.status)).length;
          const selected = tab.key === active.key;
          return (
            <Link
              key={tab.key}
              href={`/my-ads?tab=${tab.key}`}
              aria-current={selected ? "page" : undefined}
              className={clsx(
                "flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition",
                selected ? "bg-brand-600 text-white" : "text-ink-700 hover:bg-brand-50",
              )}
            >
              {tab.label}
              {count > 0 && (
                <span className={clsx("rounded-full px-1.5 text-[11px]", selected ? "bg-white/25" : "bg-brand-50 text-brand-700")}>{count}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {!sellerId ? (
        <EmptyState icon={Megaphone} title="Only seller accounts can post ads">
          Complete your account verification to become a seller.
        </EmptyState>
      ) : !page ? (
        <EmptyState icon={Megaphone} title="Couldn't load your ads">
          Please refresh the page in a moment.
        </EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState icon={Megaphone} title={`No ${active.label.toLowerCase()} ads`}>
          {active.empty}
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {visible.map((listing) => (
            <li key={listing.id}>
              <AdRow listing={listing} />
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}

function AdRow({ listing }: { listing: Listing }) {
  const thumbnail = safeHttpUrl(listing.mediaUrls[0]);
  const isDraft = listing.status === "Draft";
  const rejected = isDraft && !!listing.reviewNote;
  const expiringSoon = listing.status === "ExpiringSoon";
  const href = isDraft ? `/sell?draft=${listing.id}` : `/listing/${listing.id}`;

  return (
    <article className={`${cardClass} p-4`}>
      <Link href={href} className="flex gap-4">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnail} alt="" loading="lazy" referrerPolicy="no-referrer" className="size-20 shrink-0 rounded-xl object-cover" />
        ) : (
          <span className="grid size-20 shrink-0 place-items-center rounded-xl bg-canvas text-ink-300">
            <ImageOff aria-hidden className="size-6" />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 font-semibold">{listing.title}</span>
          <span className="mt-0.5 block font-semibold text-brand-700">{listing.price !== null ? formatNaira(listing.price) : "Price on request"}</span>
          <span className={clsx("mt-1 flex items-center gap-1 text-xs", expiringSoon ? "text-gold-700" : "text-ink-500")}>
            {(listing.status === "PendingReview" || expiringSoon) && <Clock aria-hidden className="size-3.5" />}
            {statusLine(listing)}
          </span>
        </span>
      </Link>
      {rejected && (
        <p className="mt-3 flex gap-2 rounded-xl bg-danger/5 p-3 text-sm text-ink-700">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-danger" />
          <span>
            <strong className="font-semibold text-danger">Not approved: </strong>
            {listing.reviewNote}
          </span>
        </p>
      )}
      {isDraft && (
        <div className="mt-3 flex gap-2">
          <Link href={`/sell?draft=${listing.id}`} className={buttonClass("outline", "sm", "flex-1")}>
            <Pencil aria-hidden className="size-4" /> Continue editing
          </Link>
          <Link href={`/sell/${listing.id}/promote`} className={buttonClass("primary", "sm", "flex-1")}>
            <Rocket aria-hidden className="size-4" /> {rejected ? "Resubmit" : "Pay & submit"}
          </Link>
        </div>
      )}
    </article>
  );
}
