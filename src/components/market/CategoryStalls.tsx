import Link from "next/link";
import { Store } from "lucide-react";

import type { Category } from "@/lib/api/types";
import { safeHttpUrl } from "@/lib/format";

/** Top-level categories as market stalls - each with its own little striped canopy. */
export function CategoryStalls({ categories }: { categories: Category[] }) {
  const stalls = categories.filter((c) => !c.parentCategoryId).sort((a, b) => a.name.localeCompare(b.name));
  if (stalls.length === 0) return null;

  return (
    <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
      {stalls.map((category) => {
        const image = safeHttpUrl(category.imageUrl);
        return (
          <li key={category.id}>
            <Link
              href={`/search?categoryId=${category.id}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-canvas-dark/60 transition hover:-translate-y-0.5 hover:shadow-lift hover:ring-gold-300"
            >
              <div aria-hidden className="awning-sm h-3 shrink-0" />
              <div className="flex flex-1 flex-col items-center gap-2 px-2 pb-4 pt-3 text-center">
                <span className="grid size-14 place-items-center overflow-hidden rounded-2xl bg-brand-50 ring-1 ring-brand-100 transition group-hover:bg-gold-50 sm:size-16">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt="" loading="lazy" referrerPolicy="no-referrer" className="size-full object-cover" />
                  ) : (
                    <Store aria-hidden className="size-7 text-brand-600" />
                  )}
                </span>
                <span className="line-clamp-2 text-[13px] font-medium leading-tight text-ink-900 sm:text-sm">{category.name}</span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
