/** Pages render on the server - show times in Nigerian time, not the server's. */
const TZ = "Africa/Lagos";

const naira = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 });

export function formatNaira(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "Contact for price";
  return `₦${naira.format(amount)}`;
}

/** Plan prices, office pickup amounts and ad spend come from the API in kobo. */
export function formatKobo(kobo: number | null | undefined): string {
  return formatNaira(kobo === null || kobo === undefined ? null : Math.round(kobo) / 100);
}

/** "12 Mar 2026". */
export function shortDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric", timeZone: TZ });
}

/** "12 Mar, 4:05 pm". */
export function dateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: TZ });
}

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

/** "3 days ago", "yesterday", "just now". */
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "";
  const seconds = (Date.parse(iso) - Date.now()) / 1000;
  if (!Number.isFinite(seconds)) return "";
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

export function memberSince(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-NG", { month: "long", year: "numeric", timeZone: TZ });
}

/** A YouTube watch/share/shorts URL -> its 11-char video id, or null. */
export function youTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.slice(1);
    else if (host === "youtube.com") id = u.searchParams.get("v") ?? u.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1] ?? null;
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

/** Only http(s) URLs pass - anything else (javascript:, data:) is dropped before it reaches an href or src. */
export function safeHttpUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}
