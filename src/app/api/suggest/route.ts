import { api } from "@/lib/api/client";
import type { Category, PagedResult, SearchResultItem } from "@/lib/api/types";

// Search-as-you-type for the search box: matching ad names, each with where it's filed
// ("Phones & Tablets › Phones"), plus categories whose names match. Public, read-only, and returns
// only these fields - not a way to reach the API in general.

export type Suggestion = {
  ads: { id: string; title: string; categoryId: string; path: string }[];
  categories: { id: string; path: string }[];
};

const MAX_ADS = 6;
const MAX_CATEGORIES = 3;
const CATEGORY_TTL_MS = 5 * 60_000;

let categoryCache: { at: number; list: Category[] } | null = null;

async function categories(): Promise<Category[]> {
  if (categoryCache && Date.now() - categoryCache.at < CATEGORY_TTL_MS) return categoryCache.list;
  const list = await api.get<Category[]>("/categories", false);
  categoryCache = { at: Date.now(), list };
  return list;
}

function pathOf(id: string, byId: Map<string, Category>): string {
  const category = byId.get(id);
  if (!category) return "";
  const parent = category.parentCategoryId ? byId.get(category.parentCategoryId) : undefined;
  return parent ? `${parent.name} › ${category.name}` : category.name;
}

const json = (body: Suggestion, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "private, max-age=30" } });

export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim().replace(/\s+/g, " ");
  if (q.length < 2 || q.length > 60) return json({ ads: [], categories: [] });

  const [list, results] = await Promise.all([
    categories().catch(() => [] as Category[]),
    api
      .get<PagedResult<SearchResultItem>>(`/search?${new URLSearchParams({ query: q, pageSize: "15" })}`, false)
      .catch(() => null),
  ]);
  const byId = new Map(list.map((c) => [c.id, c]));

  // One row per name-and-category, so ten "iPhone 12" ads in Phones show once.
  const seen = new Set<string>();
  const ads: Suggestion["ads"] = [];
  for (const item of results?.items ?? []) {
    const key = `${item.title.trim().toLowerCase()}|${item.categoryId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    ads.push({ id: item.id, title: item.title.trim(), categoryId: item.categoryId, path: pathOf(item.categoryId, byId) });
    if (ads.length === MAX_ADS) break;
  }

  const needle = q.toLowerCase();
  const matchingCategories = list
    .filter((c) => c.name.toLowerCase().includes(needle))
    .slice(0, MAX_CATEGORIES)
    .map((c) => ({ id: c.id, path: pathOf(c.id, byId) }));

  return json({ ads, categories: matchingCategories });
}
