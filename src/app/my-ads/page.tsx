import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { ArrowUpCircle, CircleAlert, Clock, ImageOff, Megaphone, Pencil, Plus, RefreshCw, Rocket, Send } from "lucide-react";

import { Container } from "@/components/Container";
import { EmptyState, SectionHeading } from "@/components/market/Badges";
import { buttonClass, cardClass } from "@/components/ui/styles";
import { settle } from "@/lib/api/client";
import { getSellerListings } from "@/lib/api/marketplace";
import { getPromotionPlans } from "@/lib/api/services/seller";
import type { Listing, PromotionPlan } from "@/lib/api/types";
import { requireUser } from "@/lib/auth/session";
import { formatNaira, safeHttpUrl, shortDate, timeAgo } from "@/lib/format";
import { canDelete, canUpgrade, hasRunningPlan } from "@/lib/listings";
import { DeleteAdButton } from "./DeleteAdButton";

export const metadata: Metadata = { title: "My ads", robots: { index: false } };

type TabKey = "active" | "draft" | "pending" | "rejected" | "expired";

/** A draft our team sent back - a first submission, or an edit of a live ad. */
const isRejected = (l: Listing) => l.status === "Draft" && !!l.reviewNote;

const TABS: { key: TabKey; label: string; matches: (l: Listing) => boolean; empty: string }[] = [
  { key: "active", label: "Active", matches: (l) => l.status === "Active" || l.status === "ExpiringSoon", empty: "You have no live ads. Approved ads show up here." },
  { key: "draft", label: "Draft", matches: (l) => l.status === "Draft" && !l.reviewNote, empty: "No drafts. Ads you started but haven't paid for show up here." },
  { key: "pending", label: "Pending", matches: (l) => l.status === "PendingReview", empty: "Nothing waiting for approval. Published ads and edits wait here until our team approves them." },
  { key: "rejected", label: "Rejected", matches: isRejected, empty: "Nothing was turned down. Ads our team doesn't approve show up here for you to fix." },
  { key: "expired", label: "Expired", matches: (l) => l.status === "Expired", empty: "No expired ads." },
];

/** A seller rarely has more than a few dozen ads; one page covers them and keeps the tab counts exact. */
const PAGE_SIZE = 100;

function statusLine(listing: Listing): string {
  switch (listing.status) {
    case "Active":
    case "ExpiringSoon":
      return listing.expiresAt ? `Expires ${timeAgo(listing.expiresAt)}` : "Live";
    case "PendingReview":
      return hasRunningPlan(listing)
        ? `Changes submitted ${timeAgo(listing.updatedAt)} · waiting for approval`
        : `Submitted ${timeAgo(listing.updatedAt)} · waiting for approval`;
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
  const [page, plans] = await Promise.all([
    sellerId ? settle(getSellerListings(sellerId, 1, PAGE_SIZE)) : Promise.resolve(null),
    settle(getPromotionPlans()),
  ]);
  const listings = page?.items ?? [];
  const visible = listings.filter(active.matches);

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

      <nav
        aria-label="Ad status"
        className="no-scrollbar mb-6 flex gap-1 overflow-x-auto rounded-2xl bg-white p-1 shadow-card ring-1 ring-canvas-dark/60"
      >
        {TABS.map((tab) => {
          const count = listings.filter(tab.matches).length;
          const selected = tab.key === active.key;
          return (
            <Link
              key={tab.key}
              href={`/my-ads?tab=${tab.key}`}
              aria-current={selected ? "page" : undefined}
              className={clsx(
                "flex flex-1 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold transition",
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
              <AdRow listing={listing} plans={plans ?? []} />
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}

function AdRow({ listing, plans }: { listing: Listing; plans: PromotionPlan[] }) {
  const thumbnail = safeHttpUrl(listing.mediaUrls[0]);
  const isDraft = listing.status === "Draft";
  const rejected = isRejected(listing);
  const running = hasRunningPlan(listing);
  // A rejected edit of a live ad: its plan is still running, so fixing it costs nothing.
  const rejectedEdit = rejected && running;
  const expiringSoon = listing.status === "ExpiringSoon";
  const expired = listing.status === "Expired";
  const live = listing.status === "Active" || expiringSoon;
  const editable = isDraft || expired || live;
  const href = isDraft ? `/sell?draft=${listing.id}` : `/listing/${listing.id}`;
  const plan = plans.find((p) => p.id === listing.promotionPlanId);
  // Paid for and not used up: waiting for review, or a plan still running.
  const paidPlan = plan && plan.price > 0 && (listing.status === "PendingReview" || running) ? plan.name : null;

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
          {plan && (live || running) && (
            <span className="mt-0.5 block text-xs text-ink-500">
              {plan.name} plan{listing.expiresAt ? ` until ${shortDate(listing.expiresAt)}` : ""}
            </span>
          )}
        </span>
      </Link>
      {rejected && (
        <p className="mt-3 flex gap-2 rounded-xl bg-danger/5 p-3 text-sm text-ink-700">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-danger" />
          <span>
            <strong className="font-semibold text-danger">{rejectedEdit ? "Changes not approved: " : "Not approved: "}</strong>
            {listing.reviewNote}
            {rejectedEdit && " Fix it and resubmit for free. Your plan keeps running."}
          </span>
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2 [&>*]:min-w-[8.5rem] [&>*]:flex-1">
        {editable && (
          <Link href={`/sell?draft=${listing.id}`} className={buttonClass("outline", "sm")}>
            <Pencil aria-hidden className="size-4" /> {isDraft && !rejected ? "Continue editing" : rejectedEdit ? "Fix & resubmit" : "Edit"}
          </Link>
        )}
        {isDraft && !rejectedEdit && (
          <Link href={`/sell/${listing.id}/promote`} className={buttonClass("primary", "sm")}>
            <Rocket aria-hidden className="size-4" /> {rejected ? "Pay & resubmit" : "Pay & submit"}
          </Link>
        )}
        {rejectedEdit && (
          <Link href={`/sell?draft=${listing.id}`} className={buttonClass("primary", "sm")}>
            <Send aria-hidden className="size-4" /> Resubmit
          </Link>
        )}
        {expired && (
          <Link href={`/sell/${listing.id}/promote`} className={buttonClass("primary", "sm")}>
            <RefreshCw aria-hidden className="size-4" /> Renew
          </Link>
        )}
        {canUpgrade(listing) && (
          <Link href={`/sell/${listing.id}/promote`} className={buttonClass(live ? "gold" : "outline", "sm")}>
            <ArrowUpCircle aria-hidden className="size-4" /> Upgrade plan
          </Link>
        )}
        {canDelete(listing) && <DeleteAdButton listingId={listing.id} title={listing.title} paidPlan={paidPlan} />}
      </div>
    </article>
  );
}
