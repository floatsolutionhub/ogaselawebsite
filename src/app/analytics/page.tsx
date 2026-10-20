import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { ArrowDownRight, ArrowUpRight, ChartColumn, ImageOff, Minus } from "lucide-react";

import { Container } from "@/components/Container";
import { EmptyState, SectionHeading } from "@/components/market/Badges";
import { cardClass } from "@/components/ui/styles";
import { settle } from "@/lib/api/client";
import { getSellerListings } from "@/lib/api/marketplace";
import { getListingAnalytics, getSellerAnalytics } from "@/lib/api/services/seller";
import type { AnalyticsDays, ExternalPlatformEngagement, ListingAnalytics, MetricComparison } from "@/lib/api/types";
import { requireUser } from "@/lib/auth/session";
import { formatKobo, safeHttpUrl, shortDate } from "@/lib/format";

export const metadata: Metadata = { title: "Analytics", robots: { index: false } };

const PERIODS: { days: AnalyticsDays; label: string }[] = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
];

/** 1,284 / 12.9K / 1.2M - tile values stay short. */
function compact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  if (value >= 10_000) return `${(value / 1_000).toFixed(value >= 100_000 ? 0 : 1)}K`;
  return value.toLocaleString("en-NG");
}

function percent(numerator: number, denominator: number): string {
  return denominator <= 0 ? "N/A" : `${((numerator / denominator) * 100).toFixed(1)}%`;
}

export default async function AnalyticsPage({ searchParams }: PageProps<"/analytics">) {
  const user = await requireUser("/analytics");
  const params = await searchParams;
  const days = (PERIODS.find((p) => String(p.days) === params.days)?.days ?? 30) as AnalyticsDays;
  const sellerId = user.sellerProfile?.id;

  if (!sellerId) {
    return (
      <Container className="max-w-4xl py-8 sm:py-12">
        <SectionHeading eyebrow="Your stall" title="Analytics" />
        <EmptyState icon={ChartColumn} title="Analytics are for seller accounts">
          Complete your account verification to start selling, and your numbers will show up here.
        </EmptyState>
      </Container>
    );
  }

  const [summary, page] = await Promise.all([settle(getSellerAnalytics(days)), settle(getSellerListings(sellerId, 1, 100))]);
  // Drafts and ads awaiting approval have never been shown to buyers - nothing to analyse.
  const ads = (page?.items ?? []).filter((l) => l.status !== "Draft" && l.status !== "PendingReview");
  const selected = ads.find((a) => a.id === params.ad) ?? ads[0];
  const adAnalytics = selected ? await settle(getListingAnalytics(selected.id, days)) : null;
  const link = (next: { days?: number; ad?: string }) => {
    const query = new URLSearchParams({ days: String(next.days ?? days) });
    const ad = next.ad ?? selected?.id;
    if (ad) query.set("ad", ad);
    return `/analytics?${query}`;
  };

  return (
    <Container className="max-w-5xl py-8 sm:py-12">
      <SectionHeading eyebrow="Your stall" title="Analytics" />

      <nav aria-label="Period" className="mb-8 inline-grid grid-cols-3 gap-1 rounded-2xl bg-white p-1 shadow-card ring-1 ring-canvas-dark/60">
        {PERIODS.map((period) => (
          <Link
            key={period.days}
            href={link({ days: period.days })}
            aria-current={period.days === days ? "page" : undefined}
            className={clsx("rounded-xl px-5 py-2 text-sm font-semibold", period.days === days ? "bg-brand-600 text-white" : "text-ink-700 hover:bg-brand-50")}
          >
            {period.label}
          </Link>
        ))}
      </nav>

      {!summary ? (
        <EmptyState icon={ChartColumn} title="Couldn't load your analytics">
          Please refresh the page in a moment.
        </EmptyState>
      ) : (
        <>
          <h2 className="mb-3 text-lg font-semibold">Overview</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile label="Profile visits" metric={summary.profileVisits} days={summary.days} large />
            <StatTile label="Total impressions" metric={summary.impressions} days={summary.days} large />
            <StatTile label="Ad views" metric={summary.views} days={summary.days} />
            <StatTile
              label="Calls & chats"
              metric={{
                current: summary.callClicks.current + summary.messageStarts.current,
                previous: summary.callClicks.previous + summary.messageStarts.previous,
              }}
              days={summary.days}
            />
          </div>
          <p className="mt-3 text-xs text-ink-500">
            {shortDate(summary.from)} to {shortDate(summary.to)} · Impressions count each time one of your ads is shown in search or on the home page.
          </p>

          <h2 className="mb-3 mt-10 text-lg font-semibold">Ad performance</h2>
          {ads.length === 0 ? (
            <p className={`${cardClass} p-6 text-sm text-ink-500`}>Once one of your ads is live, its performance shows here.</p>
          ) : (
            <>
              <ul className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
                {ads.map((ad) => {
                  const image = safeHttpUrl(ad.mediaUrls[0]);
                  const active = ad.id === selected?.id;
                  return (
                    <li key={ad.id} className="w-36 shrink-0">
                      <Link
                        href={link({ ad: ad.id })}
                        aria-current={active ? "true" : undefined}
                        className={clsx("block overflow-hidden rounded-2xl border-2 bg-white", active ? "border-brand-600" : "border-canvas-dark/60 hover:border-brand-200")}
                      >
                        {image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={image} alt="" referrerPolicy="no-referrer" className="aspect-[4/3] w-full object-cover" />
                        ) : (
                          <span className="grid aspect-[4/3] place-items-center bg-canvas text-ink-300">
                            <ImageOff aria-hidden className="size-5" />
                          </span>
                        )}
                        <span className="line-clamp-2 p-2 text-xs font-medium">{ad.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className={`${cardClass} mt-4 overflow-x-auto p-5`}>
                {adAnalytics ? (
                  <>
                    <PerformanceTable data={adAnalytics} />
                    <p className="mt-3 text-xs text-ink-500">
                      Ogasela figures cover the last {adAnalytics.days} days; clicks there are ad opens. Facebook and TikTok show totals since the campaign
                      started, updated about every 20 minutes.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-ink-500">Couldn&apos;t load this ad&apos;s performance.</p>
                )}
              </div>
            </>
          )}
        </>
      )}
    </Container>
  );
}

/** Change vs the previous period, with an arrow and sign so it never relies on colour alone. */
function Delta({ metric, days }: { metric: MetricComparison; days: number }) {
  const { current, previous } = metric;
  if (current === 0 && previous === 0) return <span className="text-xs text-ink-500">No activity yet</span>;
  if (previous === 0) return <span className="text-xs font-medium text-brand-600">New this period</span>;
  const rounded = Math.round(((current - previous) / previous) * 100);
  const Icon = rounded > 0 ? ArrowUpRight : rounded < 0 ? ArrowDownRight : Minus;
  return (
    <span className={clsx("inline-flex items-center gap-0.5 text-xs font-medium", rounded > 0 ? "text-brand-600" : rounded < 0 ? "text-danger" : "text-ink-500")}>
      <Icon aria-hidden className="size-3.5" />
      {rounded > 0 ? "+" : ""}
      {rounded}% <span className="font-normal text-ink-500">vs previous {days} days</span>
    </span>
  );
}

function StatTile({ label, metric, days, large }: { label: string; metric: MetricComparison; days: number; large?: boolean }) {
  return (
    <div className={clsx(cardClass, "p-5", large && "bg-gradient-to-br from-white to-brand-50")}>
      <p className="text-sm text-ink-500">{label}</p>
      <p className="mt-1 text-3xl font-extrabold tracking-tight">{compact(metric.current)}</p>
      <div className="mt-1">
        <Delta metric={metric} days={days} />
      </div>
    </div>
  );
}

function PerformanceTable({ data }: { data: ListingAnalytics }) {
  const og = data.ogasela;
  const facebook = data.platforms.find((p) => p.platform === "Facebook");
  const tiktok = data.platforms.find((p) => p.platform === "TikTok");
  const ext = (p: ExternalPlatformEngagement | undefined, pick: (p: ExternalPlatformEngagement) => string) => (p && p.promoted ? pick(p) : "N/A");
  const rows: [string, string, string, string][] = [
    ["Impressions", compact(og.impressions.current), ext(facebook, (p) => compact(p.impressions)), ext(tiktok, (p) => compact(p.impressions))],
    ["Clicks", compact(og.views.current), ext(facebook, (p) => compact(p.clicks)), ext(tiktok, (p) => compact(p.clicks))],
    [
      "Click-through rate",
      percent(og.views.current, og.impressions.current),
      ext(facebook, (p) => percent(p.clicks, p.impressions)),
      ext(tiktok, (p) => percent(p.clicks, p.impressions)),
    ],
    ["Calls", compact(og.callClicks.current), "N/A", "N/A"],
    ["Chats started", compact(og.messageStarts.current), "N/A", "N/A"],
    ["Saves", compact(og.saves.current), "N/A", "N/A"],
    ["Ad spend", "N/A", ext(facebook, (p) => formatKobo(p.spendKobo)), ext(tiktok, (p) => formatKobo(p.spendKobo))],
  ];
  const header = (title: string, p?: ExternalPlatformEngagement) => (
    <th scope="col" className="px-3 py-2 text-left">
      <span className="block font-semibold">{title}</span>
      <span className="block text-xs font-normal text-ink-500">
        {p === undefined ? `Last ${data.days} days` : p.promoted ? (p.campaignStatus ?? "Promoted") : "Not promoted"}
      </span>
    </th>
  );
  return (
    <table className="w-full min-w-[520px] text-sm">
      <caption className="sr-only">Performance of {data.title}</caption>
      <thead className="border-b border-canvas-dark/60">
        <tr>
          <th scope="col" className="px-3 py-2 text-left font-semibold">
            Metric
          </th>
          {header("Ogasela")}
          {header("Facebook", facebook)}
          {header("TikTok", tiktok)}
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, ...values]) => (
          <tr key={label} className="border-b border-canvas-dark/40 last:border-0">
            <th scope="row" className="px-3 py-2.5 text-left font-medium text-ink-700">
              {label}
            </th>
            {values.map((value, i) => (
              <td key={i} className="px-3 py-2.5 tabular-nums">
                {value}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
