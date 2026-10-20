import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  CalendarDays,
  CircleAlert,
  ExternalLink,
  MapPin,
  Megaphone,
  ReceiptText,
  Scale,
  ShieldCheck,
  Star,
  Store,
  Tag,
  Truck,
} from "lucide-react";

import { Container } from "@/components/Container";
import { FavouriteButton } from "@/components/favourites/FavouriteButton";
import { ContactSeller } from "@/components/listing/ContactSeller";
import { Gallery } from "@/components/listing/Gallery";
import { ReportButtons } from "@/components/listing/ReportButtons";
import { ShareButton } from "@/components/listing/ShareButton";
import { SectionHeading, Stars, VerifiedBadge } from "@/components/market/Badges";
import { ListingGrid, ListingGridSkeleton } from "@/components/market/ListingCard";
import { cardClass } from "@/components/ui/styles";
import { ApiError, settle } from "@/lib/api/client";
import { getListing, getSellerListings, getSellerReviews, search, toCardItem } from "@/lib/api/marketplace";
import type { ListingDetail, SearchResultItem } from "@/lib/api/types";
import { getCurrentUser } from "@/lib/auth/session";
import { formatNaira, memberSince, safeHttpUrl, timeAgo, youTubeId } from "@/lib/format";
import { uuidSchema } from "@/lib/validation";

const UNAVAILABLE: Partial<Record<ListingDetail["status"], string>> = {
  Sold: "This item has been sold.",
  Expired: "This ad has expired.",
  Paused: "The seller has paused this ad for now.",
  Draft: "This ad isn't live yet.",
  PendingReview: "This ad is waiting for review.",
};

const RAIL_SIZE = 8;

/** Links to the ad on other platforms - only on that platform's own domain (as the API enforces). */
const SOCIAL = [
  { key: "tikTokUrl", label: "TikTok", color: "bg-[#111111]", domains: ["tiktok.com"] },
  { key: "instagramUrl", label: "Instagram", color: "bg-[#E4405F]", domains: ["instagram.com", "instagr.am"] },
  { key: "facebookUrl", label: "Facebook", color: "bg-[#1877F2]", domains: ["facebook.com", "fb.com", "fb.watch"] },
  { key: "youTubeUrl", label: "YouTube", color: "bg-[#FF0000]", domains: ["youtube.com", "youtu.be"] },
] as const;

function onDomain(url: string, domains: readonly string[]): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return domains.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

async function load(id: string): Promise<ListingDetail> {
  if (!uuidSchema.safeParse(id).success) notFound();
  try {
    return await getListing(id);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: PageProps<"/listing/[id]">): Promise<Metadata> {
  const { id } = await params;
  try {
    const listing = await load(id);
    const image = safeHttpUrl(listing.mediaUrls[0]);
    const description = `${formatNaira(listing.price)} · ${listing.location ?? "Nigeria"} · ${listing.description.slice(0, 140)}`;
    return {
      title: listing.title,
      description,
      alternates: { canonical: `/listing/${listing.id}` },
      openGraph: { title: listing.title, description, images: image ? [image] : undefined },
    };
  } catch {
    return { title: "Item" };
  }
}

export default async function ListingPage({ params }: PageProps<"/listing/[id]">) {
  const { id } = await params;
  const [listing, user] = await Promise.all([load(id), getCurrentUser()]);

  const images = listing.mediaUrls.map(safeHttpUrl).filter((u): u is string => !!u);
  const videoId = youTubeId(listing.youTubeUrl);
  const unavailable = UNAVAILABLE[listing.status];
  const isOwn = !!user && user.id === listing.seller.userId;
  const socialLinks = SOCIAL.flatMap((platform) => {
    const url = safeHttpUrl(listing[platform.key]);
    // A YouTube video plays on the page instead.
    if (!url || (platform.key === "youTubeUrl" && videoId) || !onDomain(url, platform.domains)) return [];
    return [{ ...platform, url }];
  });

  return (
    <>
      <ProductJsonLd listing={listing} images={images} />
      <Container className="py-6 sm:py-10">
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-ink-500">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <span aria-hidden>/</span>
          {listing.categoryName ? (
            <Link href={`/search?categoryId=${listing.categoryId}`} className="hover:text-brand-700">
              {listing.categoryName}
            </Link>
          ) : (
            <span>Item</span>
          )}
        </nav>

        {unavailable && (
          <p role="status" className="mb-5 flex items-center gap-2 rounded-2xl bg-gold-50 px-4 py-3 text-sm font-medium text-gold-900 ring-1 ring-gold-200">
            <CircleAlert aria-hidden className="size-4 shrink-0" /> {unavailable}
          </p>
        )}

        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-8">
            <Gallery images={images} title={listing.title} />

            <section className={`${cardClass} p-6`}>
              <h2 className="text-lg font-semibold">Description</h2>
              <p className="mt-3 whitespace-pre-line break-words text-[15px] leading-7 text-ink-700">{listing.description}</p>

              <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Fact icon={Tag} label="Condition" value={listing.condition === "New" ? "Brand new" : "Used"} />
                <Fact icon={Megaphone} label="Ad type" value={listing.promotionPlanName ? `${listing.promotionPlanName} ad` : "Standard ad"} />
                <Fact icon={MapPin} label="Location" value={listing.location ?? "Nigeria"} />
                <Fact icon={CalendarDays} label="Posted" value={timeAgo(listing.publishedAt ?? listing.createdAt)} />
                {listing.officePickupAvailable && <Fact icon={Truck} label="Office pickup" value="Available" />}
              </dl>

              {listing.condition === "Used" && typeof listing.hasOriginalReceipt === "boolean" && (
                <p
                  className={`mt-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium ${
                    listing.hasOriginalReceipt ? "bg-brand-50 text-brand-700" : "bg-canvas text-ink-500"
                  }`}
                >
                  <ReceiptText aria-hidden className="size-4" />
                  {listing.hasOriginalReceipt ? "Comes with original receipt" : "No original receipt"}
                </p>
              )}
            </section>

            {videoId && (
              <section className={`${cardClass} overflow-hidden`}>
                <h2 className="px-6 pt-5 text-lg font-semibold">Video</h2>
                <div className="mt-4 aspect-video">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                    title={`Video of ${listing.title}`}
                    loading="lazy"
                    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                    className="size-full"
                  />
                </div>
              </section>
            )}

            {socialLinks.length > 0 && (
              <section className={`${cardClass} p-6`}>
                <h2 className="text-lg font-semibold">See it on</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {socialLinks.map(({ key, label, color, url }) => (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white ${color}`}
                    >
                      {label} <ExternalLink aria-hidden className="size-3.5" />
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <section className={`${cardClass} p-6`}>
              <h1 className="text-xl font-semibold leading-snug text-ink-900 sm:text-2xl">{listing.title}</h1>
              <p className="price-tag mt-4 inline-block rounded-r-lg py-1.5 pr-4 text-2xl font-extrabold">{formatNaira(listing.price)}</p>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-ink-500">
                <MapPin aria-hidden className="size-4" /> {listing.location ?? "Nigeria"} · {timeAgo(listing.publishedAt ?? listing.createdAt)}
              </p>

              <div className="mt-6">
                {isOwn ? (
                  <p className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
                    This is your ad.{" "}
                    <Link href="/my-ads" className="font-semibold underline-offset-2 hover:underline">
                      Manage it in My ads
                    </Link>
                  </p>
                ) : unavailable ? null : (
                  <ContactSeller
                    listingId={listing.id}
                    listingTitle={listing.title}
                    sellerUserId={listing.seller.userId}
                    phone={listing.seller.phone}
                    signedIn={!!user}
                    officePickup={!!listing.officePickupAvailable}
                    blocked={!!listing.seller.isBlockedByMe}
                  />
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <FavouriteButton listingId={listing.id} title={listing.title} variant="pill" />
                <ShareButton title={listing.title} />
              </div>
            </section>

            <SellerCard seller={listing.seller} location={listing.location} />

            {!isOwn && (
              <div className="space-y-3">
                <ReportButtons listingId={listing.id} sellerUserId={listing.seller.userId} sellerName={listing.seller.businessName} />
                <Link
                  href={user ? `/disputes/new?listingId=${listing.id}` : `/sign-in?next=${encodeURIComponent(`/listing/${listing.id}`)}`}
                  className="flex items-center justify-center gap-2 rounded-full border border-canvas-dark bg-white px-4 py-3 text-sm font-semibold text-ink-700 transition hover:bg-canvas"
                >
                  <Scale aria-hidden className="size-4" /> Had a problem with this deal? Open a dispute
                </Link>
              </div>
            )}
            <SafetyTips />
          </aside>
        </div>

        {!listing.seller.isBlockedByMe && (
          <section className="mt-16">
            <SectionHeading eyebrow="Same stall" title="Other ads by this seller" />
            <Suspense fallback={<ListingGridSkeleton count={4} />}>
              <SellerAds listing={listing} />
            </Suspense>
          </section>
        )}

        <section className="mt-16">
          <Suspense fallback={<div className="skeleton h-40 rounded-2xl" />}>
            <SellerReviews sellerId={listing.seller.sellerProfileId} />
          </Suspense>
        </section>

        <section className="mt-16">
          <SectionHeading eyebrow="Around the market" title="Similar ads" />
          <Suspense fallback={<ListingGridSkeleton count={4} />}>
            <Similar listing={listing} />
          </Suspense>
        </section>
      </Container>
    </>
  );
}

function Fact({ icon: Icon, label, value }: { icon: typeof Tag; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-canvas/70 px-3.5 py-3">
      <dt className="flex items-center gap-1.5 text-xs text-ink-500">
        <Icon aria-hidden className="size-3.5" /> {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-ink-900">{value}</dd>
    </div>
  );
}

function SellerCard({ seller, location }: { seller: ListingDetail["seller"]; location: string | null }) {
  const address = seller.storeAddress ?? location;
  return (
    <section className={`${cardClass} overflow-hidden`}>
      <div aria-hidden className="awning-sm h-3" />
      <div className="p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Sold by</p>
        <div className="mt-3 flex items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-600 text-lg font-bold text-gold-300">
            {seller.businessName.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink-900">{seller.businessName}</p>
            <p className="text-xs text-ink-500">On Ogasela since {memberSince(seller.memberSince)}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <VerifiedBadge status={seller.verificationStatus} />
          {seller.isBusinessVerified && <VerifiedBadge status="" business />}
        </div>
        <p className="mt-3 flex gap-1.5 text-sm text-ink-700">
          <Store aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-500" /> {address ?? "No store address shared"}
        </p>
        <Link
          href={`/seller/${seller.sellerProfileId}`}
          className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-600"
        >
          View seller profile →
        </Link>
      </div>
    </section>
  );
}

function SafetyTips() {
  const tips = [
    "Meet in a busy, public place, or use office pickup where offered.",
    "Inspect the item properly before you pay.",
    "Never pay in advance or send money to “hold” an item.",
    "Never share an OTP or your bank PIN with anyone.",
  ];
  return (
    <section className="rounded-2xl bg-brand-900 p-6 text-brand-100">
      <h2 className="flex items-center gap-2 font-semibold text-white">
        <ShieldCheck aria-hidden className="size-5 text-gold-400" /> Buy safely
      </h2>
      <ul className="mt-3 space-y-2 text-sm leading-6">
        {tips.map((tip) => (
          <li key={tip} className="flex gap-2">
            <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold-400" />
            {tip}
          </li>
        ))}
      </ul>
    </section>
  );
}

async function SellerAds({ listing }: { listing: ListingDetail }) {
  const page = await settle(getSellerListings(listing.seller.sellerProfileId, 1, RAIL_SIZE + 1));
  const items = (page?.items ?? [])
    .filter((item) => item.id !== listing.id && (item.status === "Active" || item.status === "ExpiringSoon"))
    .slice(0, RAIL_SIZE)
    .map(toCardItem);
  if (items.length === 0) return <p className="text-sm text-ink-500">This seller has no other ads.</p>;
  return <ListingGrid items={items} />;
}

async function SellerReviews({ sellerId }: { sellerId: string }) {
  const reviews = await settle(getSellerReviews(sellerId, 1, 5));
  return (
    <>
      <SectionHeading
        eyebrow="Word on the street"
        title="Seller reviews"
        action={
          reviews && reviews.totalCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
              <Star aria-hidden className="size-4 fill-gold-400 text-gold-400" /> {reviews.averageRating.toFixed(1)}
              <span className="font-normal text-ink-500">({reviews.totalCount})</span>
            </span>
          ) : undefined
        }
      />
      {!reviews || reviews.items.length === 0 ? (
        <p className={`${cardClass} p-5 text-sm text-ink-500`}>No reviews yet.</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {reviews.items.map((review) => (
            <li key={review.id} className={`${cardClass} p-5`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{review.reviewerName ?? "Ogasela buyer"}</span>
                <span className="text-xs text-ink-300">{timeAgo(review.createdAt)}</span>
              </div>
              <Stars rating={review.rating} className="mt-1" />
              {review.comment && <p className="mt-2 break-words text-sm leading-6 text-ink-700">{review.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/** Same subcategory first, topped up from the wider parent category - other sellers only. */
async function Similar({ listing }: { listing: ListingDetail }) {
  const othersOnly = (items: SearchResultItem[]) =>
    items.filter((item) => item.sellerId !== listing.seller.sellerProfileId && item.id !== listing.id);
  let combined = othersOnly((await settle(search({ categoryId: listing.categoryId, pageSize: RAIL_SIZE * 2 })))?.items ?? []);
  if (combined.length < RAIL_SIZE && listing.parentCategoryId) {
    const seen = new Set(combined.map((item) => item.id));
    const wider = othersOnly((await settle(search({ categoryId: listing.parentCategoryId, pageSize: RAIL_SIZE * 2 })))?.items ?? []);
    combined = [...combined, ...wider.filter((item) => !seen.has(item.id))];
  }
  const items = combined.slice(0, RAIL_SIZE);
  if (items.length === 0) return <p className="text-sm text-ink-500">No similar ads yet.</p>;
  return <ListingGrid items={items} />;
}

/** schema.org Product, so search engines can show price and availability. */
function ProductJsonLd({ listing, images }: { listing: ListingDetail; images: string[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description.slice(0, 500),
    image: images.slice(0, 5),
    itemCondition: listing.condition === "New" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
    offers:
      listing.price !== null
        ? {
            "@type": "Offer",
            price: listing.price,
            priceCurrency: "NGN",
            availability: listing.status === "Active" || listing.status === "ExpiringSoon" ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
            seller: { "@type": "Organization", name: listing.seller.businessName },
          }
        : undefined,
  };
  // Escape "<" so seller-written text can never close the script tag.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
