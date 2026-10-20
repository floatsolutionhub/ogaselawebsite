"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

/**
 * One loader for the whole site. It watches the requests the page makes and, while any request
 * the visitor started is in flight (a Server Action - saving, sending, paying - or a page
 * navigation), it shows a progress bar and blocks further taps, so nobody double-submits by
 * tapping again. A "Loading…" pill appears only if it takes a moment, so quick actions don't
 * flicker.
 *
 * "Started by the visitor" means within a moment of a tap, click, key press or form submit, or
 * straight after another tracked request finished (a save that then navigates). Background
 * traffic - live chat updates, unread counts, activity pings, search suggestions, link
 * prefetching - never triggers it.
 */

const GESTURE_WINDOW_MS = 1500;
const SHOW_PILL_AFTER_MS = 300;
/** A request that never answers mustn't lock the page for good. */
const MAX_LOCK_MS = 25_000;
/** How long a navigation may take to show its page once its data is in (code still loading). */
const MAX_SWITCH_MS = 8_000;

let installed = false;
let pending = 0;
let lastGesture = 0;
const listeners = new Set<(count: number) => void>();

function notify() {
  listeners.forEach((listener) => listener(pending));
}

function header(init: RequestInit | undefined, input: RequestInfo | URL, name: string): string | null {
  const fromInit = init?.headers ? new Headers(init.headers).get(name) : null;
  if (fromInit !== null) return fromInit;
  return input instanceof Request ? input.headers.get(name) : null;
}

/** Server Actions and page navigations the visitor just started - nothing else. */
function shouldTrack(input: RequestInfo | URL, init?: RequestInit): boolean {
  if (Date.now() - lastGesture > GESTURE_WINDOW_MS) return false;
  let url: URL;
  try {
    url = new URL(input instanceof Request ? input.url : String(input), window.location.href);
  } catch {
    return false;
  }
  if (url.origin !== window.location.origin || url.pathname.startsWith("/api/")) return false;
  // Link prefetching (whole-route and per-segment) happens on its own, not because of a tap.
  if (header(init, input, "next-router-prefetch") || header(init, input, "next-router-segment-prefetch")) return false;
  return header(init, input, "next-action") !== null || header(init, input, "rsc") !== null;
}

const here = () => window.location.pathname + window.location.search;

/** The page a navigation request is for, without Next's cache-busting `_rsc` parameter. */
function destination(input: RequestInfo | URL): string {
  const url = new URL(input instanceof Request ? input.url : String(input), window.location.href);
  url.searchParams.delete("_rsc");
  return url.pathname + url.search;
}

/** Resolves once the address bar shows a different page than `from` (or after the cap). */
function untilPageChanges(from: string, deadline: number): Promise<void> {
  return new Promise((resolve) => {
    const check = () => {
      if (here() !== from || Date.now() > deadline) resolve();
      else setTimeout(check, 100);
    };
    check();
  });
}

function install() {
  if (installed) return;
  installed = true;

  const mark = () => {
    lastGesture = Date.now();
  };
  window.addEventListener("pointerdown", mark, { capture: true, passive: true });
  window.addEventListener("keydown", mark, { capture: true, passive: true });
  window.addEventListener("submit", mark, { capture: true });

  const original = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    if (!shouldTrack(input, init)) return original(input, init);
    pending++;
    notify();
    const startedAt = here();
    const isAction = header(init, input, "next-action") !== null;
    const target = isAction ? null : destination(input);
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      pending = Math.max(0, pending - 1);
      // Whatever this request leads to next (e.g. a navigation after a save) still counts.
      lastGesture = Date.now();
      notify();
    };
    const timer = setTimeout(release, MAX_LOCK_MS);
    const done = () => {
      clearTimeout(timer);
      release();
    };
    let response: Response;
    try {
      response = await original(input, init);
    } catch (error) {
      done();
      throw error;
    }
    // The response starts arriving long before the page's data has finished downloading on a
    // slow connection. Stay locked until the whole body is in: read a copy to the end, leaving
    // the original untouched for Next.js.
    const reader = response.clone().body?.getReader();
    if (!reader) {
      done();
      return response;
    }
    (async () => {
      try {
        while (!(await reader.read()).done) {
          // Discard - only the end matters.
        }
        // A navigation isn't over until the new page shows: its code may still be loading.
        // (A refresh of this same page is done now.) Same for an action that redirects.
        const navigates = isAction ? response.headers.has("x-action-redirect") : target !== startedAt;
        if (navigates) await untilPageChanges(startedAt, Date.now() + MAX_SWITCH_MS);
      } catch {
        // Aborted or failed - either way it's over.
      } finally {
        done();
      }
    })();
    return response;
  };
}

export function PageLoader() {
  const [count, setCount] = useState(0);
  const [showPill, setShowPill] = useState(false);
  const busy = count > 0;

  useEffect(() => {
    install();
    listeners.add(setCount);
    return () => {
      listeners.delete(setCount);
    };
  }, []);

  useEffect(() => {
    if (!busy) return;
    const timer = setTimeout(() => setShowPill(true), SHOW_PILL_AFTER_MS);
    return () => {
      clearTimeout(timer);
      setShowPill(false);
    };
  }, [busy]);

  if (!busy) return null;
  return (
    <>
      {/* Blocks repeat taps while the request is in flight. */}
      <div aria-hidden className="fixed inset-0 z-[200] cursor-wait" />
      <div role="progressbar" aria-label="Loading" className="fixed inset-x-0 top-0 z-[201] h-1 overflow-hidden bg-brand-100/60">
        <div className="page-loader-bar h-full w-1/3 rounded-full bg-gradient-to-r from-gold-400 via-gold-300 to-brand-500" />
      </div>
      {showPill && (
        <div role="status" className="fixed left-1/2 top-24 z-[201] -translate-x-1/2">
          <span className="animate-rise inline-flex items-center gap-2 rounded-full bg-brand-900/90 px-4 py-2 text-sm font-semibold text-white shadow-lift backdrop-blur">
            <LoaderCircle aria-hidden className="size-4 animate-spin text-gold-400" /> Loading…
          </span>
        </div>
      )}
    </>
  );
}
