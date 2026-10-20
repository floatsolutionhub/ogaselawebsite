import Link from "next/link";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Page links that keep the rest of the query string. `params` is the current query. */
export function Pagination({
  basePath,
  params,
  page,
  pageSize,
  totalCount,
}: {
  basePath: string;
  params: Record<string, string>;
  page: number;
  pageSize: number;
  totalCount: number;
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const query = new URLSearchParams(params);
    if (p > 1) query.set("page", String(p));
    else query.delete("page");
    const qs = query.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const pages = Array.from(new Set([1, page - 1, page, page + 1, totalPages]))
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const linkClass = "grid h-10 min-w-10 place-items-center rounded-full px-3 text-sm font-semibold transition";

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link href={href(page - 1)} className={clsx(linkClass, "text-ink-700 hover:bg-brand-50")} aria-label="Previous page">
          <ChevronLeft aria-hidden className="size-4" />
        </Link>
      ) : null}
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && p - pages[i - 1] > 1 && <span className="px-1 text-ink-300">…</span>}
          <Link
            href={href(p)}
            aria-current={p === page ? "page" : undefined}
            className={clsx(linkClass, p === page ? "bg-brand-600 text-white" : "text-ink-700 hover:bg-brand-50")}
          >
            {p}
          </Link>
        </span>
      ))}
      {page < totalPages ? (
        <Link href={href(page + 1)} className={clsx(linkClass, "text-ink-700 hover:bg-brand-50")} aria-label="Next page">
          <ChevronRight aria-hidden className="size-4" />
        </Link>
      ) : null}
    </nav>
  );
}
