import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, BadgeCheck, Flame, Store } from "lucide-react";

import { VerificationBanner } from "@/components/account/VerificationBanner";
import { Container } from "@/components/Container";
import { ComingSoon } from "@/components/home/ComingSoon";
import { HomeExtras } from "@/components/home/HomeExtras";
import { Testimonials } from "@/components/home/Testimonials";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { LocationPill } from "@/components/layout/LocationPill";
import { EmptyState, SectionHeading } from "@/components/market/Badges";
import { CategoryStalls } from "@/components/market/CategoryStalls";
import { StoreBadges } from "@/components/site/StoreBadges";
import { CtaBanner } from "@/components/site/sections/CtaBanner";
import { Faqs } from "@/components/site/sections/Faqs";
import { Features } from "@/components/site/sections/Features";
import { GetInvolved } from "@/components/site/sections/GetInvolved";
import { HowItWorks } from "@/components/site/sections/HowItWorks";
import { ListingGrid, ListingGridSkeleton } from "@/components/market/ListingCard";
import { buttonClass } from "@/components/ui/styles";
import { settle } from "@/lib/api/client";
import { getCategories, getHotPicks } from "@/lib/api/marketplace";
import { getVerificationOverview } from "@/lib/api/services/me";
import { getActiveAnnouncements } from "@/lib/api/services/misc";
import { getCurrentUser } from "@/lib/auth/session";
import { getShopLocation } from "@/lib/location.server";
import { uuidSchema } from "@/lib/validation";

const POPULAR = ["iPhone", "Toyota Camry", "Generator", "Sofa", "Sneakers", "Laptop"];

/** Hot Picks: up to 48, 16 more per "Load more". The seed keeps the shuffle stable while paging. */
const HOT_PAGE = 16;
const HOT_MAX_PAGES = 3;

type HotParams = { seed: number; pages: number; categoryId?: string; allLocations: boolean };

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const seedParam = Number(params.seed);
  const hot: HotParams = {
    seed: Number.isInteger(seedParam) && seedParam > 0 && seedParam < 1e9 ? seedParam : newSeed(),
    pages: Math.min(HOT_MAX_PAGES, Math.max(1, Number(params.more) + 1 || 1)),
    categoryId: uuidSchema.safeParse(params.hot).success ? (params.hot as string) : undefined,
    allLocations: params.all === "1",
  };
  const [user, announcements] = await Promise.all([getCurrentUser(), settle(getActiveAnnouncements())]);
  const verification = user ? await settle(getVerificationOverview()) : null;

  return (
    <>
      <HomeExtras announcements={announcements ?? []} />
      <Hero />

      <Container className="relative z-10 -mt-10 sm:-mt-14">
        <section aria-labelledby="stalls" className="rounded-3xl bg-white/80 p-4 shadow-lift ring-1 ring-canvas-dark/60 backdrop-blur sm:p-6">
          <h2 id="stalls" className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-clay">
            <Store aria-hidden className="size-4" /> Walk the stalls
          </h2>
          <Suspense fallback={<div className="skeleton h-28 rounded-2xl" />}>
            <Stalls />
          </Suspense>
        </section>
      </Container>

      {verification && (verification.personal.status !== "Verified" || (verification.business && verification.business.status !== "Verified")) && (
        <Container className="mt-10 grid gap-3 md:grid-cols-2">
          {verification.personal.status !== "Verified" && <VerificationBanner kind="personal" track={verification.personal} />}
          {verification.business && verification.business.status !== "Verified" && <VerificationBanner kind="business" track={verification.business} />}
        </Container>
      )}

      <Container className="mt-16" >
        <div id="hot-picks" className="scroll-mt-28">
          <SectionHeading
            eyebrow="Hot picks"
            title="What buyers are haggling over"
            action={
              <Link href="/search?sort=newest" className="hidden items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-600 sm:inline-flex">
                See all <ArrowRight aria-hidden className="size-4" />
              </Link>
            }
          />
        </div>
        <Suspense fallback={<ListingGridSkeleton count={8} />}>
          <HotPicks params={hot} />
        </Suspense>
      </Container>

      {/* ogasela.com's homepage sections (from OgaselaWebsite), with their #anchors intact:
          #how-it-works, #get-involved, #faqs and #download. */}
      <div className="mt-20">
        <HowItWorks />
        <Features />
        <Suspense fallback={null}>
          <Testimonials />
        </Suspense>
        <ComingSoon />
        <GetInvolved />
        <Faqs />
        <CtaBanner />
      </div>
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-x-clip bg-brand-800 text-white">
      <Image
        src="/images/market-square.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-35 mix-blend-luminosity"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-brand-900/95 via-brand-800/80 to-brand-700/40" />
      <div aria-hidden className="ankara absolute -right-24 top-10 hidden size-80 rotate-12 rounded-[3rem] opacity-30 lg:block" />

      <Container className="relative grid items-center gap-10 pb-24 pt-14 sm:pb-28 sm:pt-20 lg:grid-cols-[1.25fr_1fr]">
        <div className="animate-rise relative z-20">
          <div className="flex flex-wrap items-center gap-2">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-300 ring-1 ring-white/15">
              <span className="size-1.5 rounded-full bg-gold-400" /> The market is open
            </p>
            <LocationPill className="inline-flex lg:hidden" />
          </div>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Nigeria&apos;s market square,
            <span className="block text-gold-400">right in your hand.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-brand-100 sm:text-lg">
            Buy and sell anything, from anyone, near you. Verified sellers, honest prices and no wahala,
            just like your favourite market, without the traffic.
          </p>

          <div className="mt-8 max-w-xl">
            <Suspense fallback={<div className="h-11 rounded-full bg-white" />}>
              <HeaderSearch className="flex" />
            </Suspense>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-brand-200">Popular:</span>
              {POPULAR.map((term) => (
                <Link
                  key={term}
                  href={`/search?query=${encodeURIComponent(term)}`}
                  className="rounded-full bg-white/10 px-3 py-1 text-white/90 ring-1 ring-white/15 transition hover:bg-gold-400 hover:text-brand-900"
                >
                  {term}
                </Link>
              ))}
            </div>
            <div className="mt-7 flex-wrap items-center gap-x-4 gap-y-3 border-t border-white/15 pt-6">
              {/* <span className="text-sm font-semibold text-white mb-10">Download our app</span> */}
              <StoreBadges />
            </div>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="relative ml-auto aspect-[4/5] w-80 overflow-hidden rounded-[2rem] shadow-2xl ring-4 ring-white/10">
            <Image src="/images/women-market.jpg" alt="Traders at a busy Nigerian market" fill sizes="320px" className="object-cover" />
          </div>
          <div className="absolute -left-2 bottom-10 flex items-center gap-3 rounded-2xl bg-white p-3.5 pr-5 text-ink-900 shadow-lift">
            <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <BadgeCheck aria-hidden className="size-6" />
            </span>
            <span className="text-sm leading-tight">
              <span className="block font-semibold">Verified sellers</span>
              <span className="text-ink-500">ID-checked, face-matched</span>
            </span>
          </div>
          <div className="absolute -right-3 top-8 rotate-6">
            <span className="price-tag inline-block rounded-r-lg py-2 pr-4 text-lg font-extrabold shadow-lift">Best price</span>
          </div>
        </div>
      </Container>
    </section>
  );
}

async function Stalls() {
  const categories = await settle(getCategories());
  if (!categories) return <p className="text-sm text-ink-500">Categories are taking a break. Refresh in a moment.</p>;
  return <CategoryStalls categories={categories} />;
}

/** A fresh shuffle per visit, like pulling to refresh on the app. */
function newSeed() {
  return Math.floor(Math.random() * 999_999_999) + 1;
}

function hotHref(params: HotParams, change: Partial<HotParams>): string {
  const next = { ...params, ...change };
  const query = new URLSearchParams({ seed: String(next.seed) });
  if (next.pages > 1) query.set("more", String(next.pages - 1));
  if (next.categoryId) query.set("hot", next.categoryId);
  if (next.allLocations) query.set("all", "1");
  return `/?${query}#hot-picks`;
}

/** Hot Picks from the visitor's city (like the app), with "Show all" widening to everywhere. */
async function HotPicks({ params }: { params: HotParams }) {
  const [location, categories] = await Promise.all([getShopLocation(), settle(getCategories())]);
  const city = params.allLocations ? undefined : location.city || undefined;
  const result = await settle(
    getHotPicks({ page: 1, pageSize: HOT_PAGE * params.pages, seed: params.seed, categoryId: params.categoryId, location: city }),
  );
  const topLevel = (categories ?? []).filter((c) => !c.parentCategoryId).sort((a, b) => a.name.localeCompare(b.name));
  const chip = "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 transition";

  const filters = (
    <nav aria-label="Filter hot picks" className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1">
      <Link
        href={hotHref(params, { categoryId: undefined, pages: 1 })}
        aria-current={!params.categoryId ? "true" : undefined}
        className={`${chip} ${!params.categoryId ? "bg-brand-600 text-white ring-brand-600" : "bg-white text-ink-700 ring-canvas-dark hover:ring-brand-300"}`}
      >
        Everything
      </Link>
      {topLevel.map((c) => (
        <Link
          key={c.id}
          href={hotHref(params, { categoryId: c.id, pages: 1 })}
          aria-current={params.categoryId === c.id ? "true" : undefined}
          className={`${chip} ${params.categoryId === c.id ? "bg-brand-600 text-white ring-brand-600" : "bg-white text-ink-700 ring-canvas-dark hover:ring-brand-300"}`}
        >
          {c.name}
        </Link>
      ))}
    </nav>
  );

  if (!result) {
    return (
      <>
        {filters}
        <EmptyState icon={Flame} title="We couldn't load hot picks">
          The market is busy right now. Refresh the page in a moment.
        </EmptyState>
      </>
    );
  }

  if (result.items.length === 0) {
    return (
      <>
        {filters}
        <EmptyState
          icon={Flame}
          title={city ? `No hot picks in ${city} yet` : "The market is just opening"}
          action={
            city ? (
              <Link href={hotHref(params, { allLocations: true, pages: 1 })} className={buttonClass("primary")}>
                Show all locations
              </Link>
            ) : (
              <Link href="/sell" className={buttonClass("gold")}>
                Be the first to sell
              </Link>
            )
          }
        >
          {city ? "Nothing hot near you just now. See what's moving across Nigeria." : "No hot picks yet. Check back soon, or put your own item on display."}
        </EmptyState>
      </>
    );
  }

  const more = result.items.length < result.totalCount && params.pages < HOT_MAX_PAGES;
  return (
    <>
      {filters}
      {params.allLocations && location.city && (
        <p className="mb-4 flex flex-wrap items-center gap-2 text-sm text-ink-500">
          Showing ads from all locations ·
          <Link href={hotHref(params, { allLocations: false, pages: 1 })} className="font-semibold text-brand-700">
            Only {location.city}
          </Link>
        </p>
      )}
      <ListingGrid items={result.items} priorityCount={4} />
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {more && (
          <Link href={hotHref(params, { pages: params.pages + 1 })} scroll={false} className={buttonClass("primary", "lg")}>
            Load more hot picks
          </Link>
        )}
        <Link href="/search?sort=newest" className={buttonClass("outline", "lg")}>
          Browse the whole market <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>
      {!more && (
        <p className="mt-4 text-center text-sm text-ink-500">
          You&apos;re all caught up ·{" "}
          <Link href={hotHref(params, { seed: newSeed(), pages: 1 })} className="font-semibold text-brand-700">
            shuffle for a fresh mix
          </Link>
        </p>
      )}
    </>
  );
}
