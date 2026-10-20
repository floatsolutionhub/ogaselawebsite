import clsx from "clsx";
import { BadgeCheck, ShieldCheck, Star } from "lucide-react";

export function VerifiedBadge({ status, business }: { status: string; business?: boolean }) {
  if (business) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2.5 py-0.5 text-xs font-semibold text-gold-800">
        <ShieldCheck aria-hidden className="size-3.5" /> Verified business
      </span>
    );
  }
  if (status !== "Verified") return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
      <BadgeCheck aria-hidden className="size-3.5" /> Verified seller
    </span>
  );
}

export function Stars({ rating, className }: { rating: number; className?: string }) {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span className={clsx("inline-flex items-center gap-0.5", className)} role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden
          className={clsx("size-4", n <= rounded ? "fill-gold-400 text-gold-400" : n - 0.5 === rounded ? "fill-gold-200 text-gold-400" : "text-ink-300")}
        />
      ))}
    </span>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="woven flex flex-col items-center rounded-3xl px-6 py-14 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-white text-brand-600 shadow-card">
        <Icon aria-hidden className="size-8" />
      </span>
      <h2 className="mt-5 text-lg font-semibold text-ink-900">{title}</h2>
      {children && <div className="mt-2 max-w-md text-sm leading-6 text-ink-500">{children}</div>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{eyebrow}</p>}
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink-900 sm:text-[28px]">{title}</h2>
      </div>
      {action}
    </div>
  );
}
