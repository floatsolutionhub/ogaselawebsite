import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { z } from "zod";
import { SearchX, SlidersHorizontal, X } from "lucide-react";

import { Container } from "@/components/Container";
import { EmptyState } from "@/components/market/Badges";
import { ListingGrid, ListingGridSkeleton } from "@/components/market/ListingCard";
import { Pagination } from "@/components/market/Pagination";
import { buttonClass, inputClass } from "@/components/ui/styles";
import { NIGERIAN_STATES } from "@/config/site";
import { settle } from "@/lib/api/client";
import { getCategories, search, type SearchFilters } from "@/lib/api/marketplace";
import type { Category } from "@/lib/api/types";
import { formatNaira } from "@/lib/format";
import { getShopLocation } from "@/lib/location.server";
import { uuidSchema } from "@/lib/validation";

const PAGE_SIZE = 24;

const SORTS = [
  { value: "relevance", label: "Best match" },
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "distance", label: "Nearest", needsLocation: true },
] as const;

const RADII = [5, 10, 25, 50, 100] as const;

/** Anything malformed in the URL is dropped rather than passed to the API. */
/** First value of a repeated param; blank form fields ("") count as unset. */
const one = (v: unknown) => {
  const first = Array.isArray(v) ? v[0] : v;
  return first === "" ? undefined : first;
};
const filtersSchema = z.object({
  query: z.preprocess(one, z.string().trim().max(100).optional()).catch(undefined),
  categoryId: z.preprocess(one, uuidSchema.optional()).catch(undefined),
  location: z.preprocess(one, z.string().trim().max(60).optional()).catch(undefined),
  minPrice: z.preprocess(one, z.coerce.number().int().min(0).max(1e12).optional()).catch(undefined),
  maxPrice: z.preprocess(one, z.coerce.number().int().min(0).max(1e12).optional()).catch(undefined),
  condition: z.preprocess(one, z.enum(["New", "Used"]).optional()).catch(undefined),
  verifiedSellerOnly: z.preprocess((v) => one(v) === "true", z.boolean()).catch(false),
  sort: z.preprocess(one, z.enum(["relevance", "newest", "price_asc", "price_desc", "distance"]).optional()).catch(undefined),
  radiusKm: z.preprocess(one, z.coerce.number().refine((n) => (RADII as readonly number[]).includes(n)).optional()).catch(undefined),
  page: z.preprocess(one, z.coerce.number().int().min(1).max(500)).catch(1),
});

type Filters = z.infer<typeof filtersSchema>;

function parse(raw: Record<string, string | string[] | undefined>): Filters {
  return filtersSchema.parse(raw);
}

/** The current filters as query params (no page), for links that keep them. */
function toParams(filters: Filters): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (key === "page" || value === undefined || value === false) continue;
    out[key] = String(value);
  }
  return out;
}

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const { query } = parse(await searchParams);
  return {
    title: query ? `“${query}” for sale` : "Browse the market",
    robots: { index: !query, follow: true },
  };
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const filters = parse(await searchParams);
  const [categories, location] = await Promise.all([getCategories().catch(() => [] as Category[]), getShopLocation()]);
  const coords = location.latitude !== null && location.longitude !== null ? { lat: location.latitude, lng: location.longitude } : null;
  const category = categories.find((c) => c.id === filters.categoryId);
  const heading = filters.query ? `Results for “${filters.query}”` : (category?.name ?? "The whole market");

  return (
    <Container className="py-8 sm:py-10">
      <div className="mb-6">
        <nav aria-label="Breadcrumb" className="text-xs text-ink-500">
          <Link href="/" className="hover:text-brand-700">Home</Link> <span aria-hidden>/</span> Search
        </nav>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">{heading}</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside>
          {/* Phones: tucked away until asked for. Desktop: always open in the sidebar. */}
          <details className="group rounded-2xl bg-white shadow-card ring-1 ring-canvas-dark/60 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-semibold">
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal aria-hidden className="size-4 text-brand-600" /> Filters &amp; sort
              </span>
              <span className="text-xs font-medium text-ink-500 group-open:hidden">Show</span>
              <span className="hidden text-xs font-medium text-ink-500 group-open:inline">Hide</span>
            </summary>
            <FilterForm idPrefix="m" filters={filters} categories={categories} hasLocation={!!coords} />
          </details>
          <div className="sticky top-28 hidden rounded-2xl bg-white shadow-card ring-1 ring-canvas-dark/60 lg:block">
            <p className="flex items-center gap-2 px-5 py-4 font-semibold">
              <SlidersHorizontal aria-hidden className="size-4 text-brand-600" /> Filters
            </p>
            <FilterForm idPrefix="d" filters={filters} categories={categories} hasLocation={!!coords} />
          </div>
        </aside>

        <section aria-label="Results">
          <ActiveFilters filters={filters} categories={categories} />
          <SubcategoryPills filters={filters} categories={categories} />
          <Suspense key={JSON.stringify(filters)} fallback={<ListingGridSkeleton count={12} />}>
            <Results filters={filters} coords={coords} />
          </Suspense>
        </section>
      </div>
    </Container>
  );
}

async function Results({ filters, coords }: { filters: Filters; coords: { lat: number; lng: number } | null }) {
  // Distance needs the visitor's location (shared from the location picker); without it, fall back.
  const query: SearchFilters = {
    ...filters,
    sort: filters.sort === "distance" && !coords ? "relevance" : filters.sort,
    radiusKm: coords ? filters.radiusKm : undefined,
    lat: coords?.lat,
    lng: coords?.lng,
    verifiedSellerOnly: filters.verifiedSellerOnly || undefined,
    pageSize: PAGE_SIZE,
  };
  const result = await settle(search(query));
  if (!result) {
    return (
      <EmptyState icon={SearchX} title="Search is taking a break">
        We couldn&apos;t reach the market just now. Please try again in a moment.
      </EmptyState>
    );
  }
  if (result.items.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="Nothing on the shelves for that"
        action={
          <Link href="/search" className={buttonClass("outline")}>
            Clear all filters
          </Link>
        }
      >
        Try a shorter search, another category, or a wider price range.
      </EmptyState>
    );
  }
  return (
    <>
      <p className="mb-4 text-sm text-ink-500">
        {result.totalCount.toLocaleString("en-NG")} {result.totalCount === 1 ? "item" : "items"} found
      </p>
      <ListingGrid items={result.items} priorityCount={4} />
      <Pagination basePath="/search" params={toParams(filters)} page={result.page} pageSize={result.pageSize} totalCount={result.totalCount} />
    </>
  );
}

function FilterForm({ idPrefix, filters, categories, hasLocation }: { idPrefix: string; filters: Filters; categories: Category[]; hasLocation: boolean }) {
  const id = (name: string) => `${idPrefix}-${name}`;
  const parents = categories.filter((c) => !c.parentCategoryId).sort((a, b) => a.name.localeCompare(b.name));
  const childrenOf = (id: string) => categories.filter((c) => c.parentCategoryId === id).sort((a, b) => a.name.localeCompare(b.name));
  const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-500";

  return (
    <form action="/search" className="space-y-5 border-t border-canvas-dark/60 px-5 pb-5 pt-4">
      <div>
        <label htmlFor={id("query")} className={labelClass}>Keyword</label>
        <input id={id("query")} name="query" type="search" maxLength={100} defaultValue={filters.query} placeholder="What are you looking for?" className={inputClass} />
      </div>

      <div>
        <label htmlFor={id("category")} className={labelClass}>Category</label>
        <select id={id("category")} name="categoryId" defaultValue={filters.categoryId ?? ""} className={inputClass}>
          <option value="">All categories</option>
          {parents.map((parent) => (
            <optgroup key={parent.id} label={parent.name}>
              <option value={parent.id}>All {parent.name}</option>
              {childrenOf(parent.id).map((child) => (
                <option key={child.id} value={child.id}>{child.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={id("location")} className={labelClass}>Location</label>
        <select id={id("location")} name="location" defaultValue={filters.location ?? ""} className={inputClass}>
          <option value="">Anywhere in Nigeria</option>
          {NIGERIAN_STATES.map((state) => (
            <option key={state} value={state.replace(" (FCT)", "")}>{state}</option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className={labelClass}>Price (₦)</legend>
        <div className="grid grid-cols-2 gap-2">
          <input aria-label="Minimum price" name="minPrice" type="number" inputMode="numeric" min={0} step={1} defaultValue={filters.minPrice} placeholder="Min" className={inputClass} />
          <input aria-label="Maximum price" name="maxPrice" type="number" inputMode="numeric" min={0} step={1} defaultValue={filters.maxPrice} placeholder="Max" className={inputClass} />
        </div>
      </fieldset>

      <fieldset>
        <legend className={labelClass}>Condition</legend>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-canvas p-1 text-sm">
          {[
            { value: "", label: "Any" },
            { value: "New", label: "New" },
            { value: "Used", label: "Used" },
          ].map((option) => (
            <label key={option.label} className="cursor-pointer">
              <input type="radio" name="condition" value={option.value} defaultChecked={(filters.condition ?? "") === option.value} className="peer sr-only" />
              <span className="block rounded-lg py-2 text-center font-medium text-ink-700 transition peer-checked:bg-white peer-checked:text-brand-700 peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-gold-400">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-ink-700">
        <input type="checkbox" name="verifiedSellerOnly" value="true" defaultChecked={filters.verifiedSellerOnly} className="size-4 accent-brand-600" />
        Verified sellers only
      </label>

      <div>
        <label htmlFor={id("sort")} className={labelClass}>Sort by</label>
        <select id={id("sort")} name="sort" defaultValue={filters.sort ?? "relevance"} className={inputClass}>
          {SORTS.filter((sort) => !("needsLocation" in sort) || hasLocation).map((sort) => (
            <option key={sort.value} value={sort.value}>{sort.label}</option>
          ))}
        </select>
      </div>

      {hasLocation ? (
        <div>
          <label htmlFor={id("radius")} className={labelClass}>Distance from you</label>
          <select id={id("radius")} name="radiusKm" defaultValue={filters.radiusKm ?? ""} className={inputClass}>
            <option value="">Anywhere</option>
            {RADII.map((km) => (
              <option key={km} value={km}>Within {km} km</option>
            ))}
          </select>
        </div>
      ) : (
        <p className="text-xs text-ink-500">Share your location from the location picker to sort by distance.</p>
      )}

      <div className="flex gap-2 pt-1">
        <button type="submit" className={buttonClass("primary", "md", "flex-1")}>Apply filters</button>
        <Link href="/search" className={buttonClass("ghost")}>Reset</Link>
      </div>
    </form>
  );
}

function ActiveFilters({ filters, categories }: { filters: Filters; categories: Category[] }) {
  const params = toParams(filters);
  const chips: { key: string; label: string }[] = [];
  if (filters.categoryId) chips.push({ key: "categoryId", label: categories.find((c) => c.id === filters.categoryId)?.name ?? "Category" });
  if (filters.location) chips.push({ key: "location", label: filters.location });
  if (filters.minPrice !== undefined) chips.push({ key: "minPrice", label: `From ${formatNaira(filters.minPrice)}` });
  if (filters.maxPrice !== undefined) chips.push({ key: "maxPrice", label: `Up to ${formatNaira(filters.maxPrice)}` });
  if (filters.condition) chips.push({ key: "condition", label: filters.condition === "New" ? "Brand new" : "Used" });
  if (filters.verifiedSellerOnly) chips.push({ key: "verifiedSellerOnly", label: "Verified sellers" });
  if (filters.radiusKm) chips.push({ key: "radiusKm", label: `Within ${filters.radiusKm} km` });
  if (filters.sort && filters.sort !== "relevance") chips.push({ key: "sort", label: SORTS.find((x) => x.value === filters.sort)?.label ?? "Sorted" });
  if (chips.length === 0) return null;

  return (
    <ul className="mb-5 flex flex-wrap gap-2">
      {chips.map((chip) => {
        const rest = new URLSearchParams(params);
        rest.delete(chip.key);
        return (
          <li key={chip.key}>
            <Link
              href={`/search?${rest}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100"
            >
              {chip.label}
              <X aria-label={`Remove ${chip.label}`} className="size-3.5" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** A top-level category's subcategories as pills - every one visible at once, like the app. */
function SubcategoryPills({ filters, categories }: { filters: Filters; categories: Category[] }) {
  const current = categories.find((c) => c.id === filters.categoryId);
  if (!current) return null;
  const parent = current.parentCategoryId ? categories.find((c) => c.id === current.parentCategoryId) : current;
  if (!parent) return null;
  const children = categories.filter((c) => c.parentCategoryId === parent.id).sort((a, b) => a.name.localeCompare(b.name));
  if (children.length === 0) return null;
  const params = toParams(filters);
  const href = (categoryId: string) => `/search?${new URLSearchParams({ ...params, categoryId })}`;
  const pill = "rounded-full border px-3.5 py-1.5 text-sm font-medium transition";
  return (
    <nav aria-label={`${parent.name} subcategories`} className="mb-5 flex flex-wrap gap-2">
      <Link href={href(parent.id)} aria-current={current.id === parent.id ? "true" : undefined}
        className={`${pill} ${current.id === parent.id ? "border-brand-600 bg-brand-600 text-white" : "border-canvas-dark bg-white text-ink-700 hover:border-brand-300"}`}>
        All {parent.name}
      </Link>
      {children.map((child) => (
        <Link key={child.id} href={href(child.id)} aria-current={current.id === child.id ? "true" : undefined}
          className={`${pill} ${current.id === child.id ? "border-brand-600 bg-brand-600 text-white" : "border-canvas-dark bg-white text-ink-700 hover:border-brand-300"}`}>
          {child.name}
        </Link>
      ))}
    </nav>
  );
}
