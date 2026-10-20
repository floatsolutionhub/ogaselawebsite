"use client";

import Form from "next/form";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import clsx from "clsx";
import { LayoutGrid, Search } from "lucide-react";

import type { Suggestion } from "@/app/api/suggest/route";

type Option = { key: string; href: string; label: string; detail: string; kind: "ad" | "category" };

const DEBOUNCE_MS = 220;

/** Bolds the part of `text` that matches what was typed. */
function Highlight({ text, query }: { text: string; query: string }) {
  const at = text.toLowerCase().indexOf(query.toLowerCase());
  if (!query || at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <strong className="font-semibold text-ink-900">{text.slice(at, at + query.length)}</strong>
      {text.slice(at + query.length)}
    </>
  );
}

/**
 * The search box, with suggestions as you type: matching ads with where they're filed
 * ("iPhone 12 Pro Max in Phones & Tablets › Phones") and matching categories. Without JavaScript
 * it's still a plain GET form to /search.
 */
export function HeaderSearch({ className }: { className?: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const id = useId();
  const inputId = `search-${id}`;
  const listId = `search-list-${id}`;
  const [query, setQuery] = useState(params.get("query") ?? "");
  const [results, setResults] = useState<{ for: string; data: Suggestion } | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLFormElement>(null);

  const term = query.trim();

  useEffect(() => {
    if (term.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/suggest?q=${encodeURIComponent(term)}`, { signal: controller.signal })
        .then((r) => (r.ok ? (r.json() as Promise<Suggestion>) : null))
        .then((data) => data && setResults({ for: term, data }))
        .catch(() => {});
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term]);

  // Close when clicking anywhere else.
  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, []);

  const data = term.length >= 2 && results?.for === term ? results.data : null;
  const options: Option[] = data
    ? [
        ...data.ads.map((ad) => ({
          key: `ad-${ad.id}`,
          href: `/search?${new URLSearchParams({ query: ad.title, categoryId: ad.categoryId })}`,
          label: ad.title,
          detail: ad.path ? `in ${ad.path}` : "",
          kind: "ad" as const,
        })),
        ...data.categories.map((c) => ({
          key: `cat-${c.id}`,
          href: `/search?categoryId=${c.id}`,
          label: c.path,
          detail: "Category",
          kind: "category" as const,
        })),
      ]
    : [];
  const showList = open && options.length > 0;

  const go = (option: Option) => {
    setOpen(false);
    setActive(-1);
    setQuery(option.kind === "ad" ? option.label : "");
    router.push(option.href);
  };

  return (
    <Form ref={boxRef} action="/search" role="search" className={clsx("relative max-w-xl", className)} onSubmit={() => setOpen(false)}>
      <label htmlFor={inputId} className="sr-only">
        Search Ogasela
      </label>
      <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-ink-500" />
      <input
        id={inputId}
        name="query"
        type="search"
        maxLength={100}
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (!showList) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((i) => (i + 1) % options.length);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((i) => (i <= 0 ? options.length - 1 : i - 1));
          } else if (event.key === "Enter" && active >= 0) {
            event.preventDefault();
            go(options[active]);
          } else if (event.key === "Escape") {
            setOpen(false);
            setActive(-1);
          }
        }}
        placeholder="Search phones, cars, fashion, furniture…"
        className="h-11 w-full rounded-full border-2 border-transparent bg-white pl-11 pr-28 text-[15px] text-ink-900 placeholder:text-ink-500 focus:border-gold-400 focus:outline-none"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-full bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-500"
      >
        Search
      </button>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Suggestions"
          className="absolute inset-x-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl bg-white py-2 text-left shadow-lift ring-1 ring-canvas-dark/70"
        >
          {options.map((option, index) => (
            <li
              key={option.key}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => go(option)}
              onMouseEnter={() => setActive(index)}
              className={clsx("flex cursor-pointer items-center gap-3 px-4 py-2.5", index === active && "bg-brand-50")}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-canvas text-ink-500">
                {option.kind === "ad" ? <Search aria-hidden className="size-4" /> : <LayoutGrid aria-hidden className="size-4" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] text-ink-700">
                  <Highlight text={option.label} query={term} />
                </span>
                {option.detail && <span className="block truncate text-xs text-brand-700">{option.detail}</span>}
              </span>
            </li>
          ))}
          <li role="presentation" className="mt-1 border-t border-canvas-dark/60 px-4 pt-2">
            <button
              type="submit"
              onPointerDown={(event) => event.preventDefault()}
              className="w-full truncate py-1.5 text-left text-sm font-semibold text-brand-700 hover:text-brand-600"
            >
              Search all ads for “{term}”
            </button>
          </li>
        </ul>
      )}
    </Form>
  );
}
