import { Apple, PlayCircle } from "lucide-react";
import clsx from "clsx";
import { site } from "@/lib/site";

/** The two store badges (App Store / Google Play) - shared so they can appear in more than one place on the homepage without duplicating markup. */
export function StoreBadges({
  variant = "dark",
  className,
}: {
  variant?: "dark" | "light";
  className?: string;
}) {
  const badgeClasses = clsx(
    "flex items-center gap-2.5 rounded-xl px-4 py-2.5 transition-transform hover:-translate-y-0.5",
    variant === "dark" ? "bg-black text-white" : "bg-white text-ink-900 shadow-md shadow-ink-900/10"
  );

  return (
    <div className={clsx("flex flex-wrap items-center gap-3", className)}>
      <a href={site.appStore} className={badgeClasses}>
        <Apple size={22} />
        <span className="text-left leading-tight">
          <span
            className={clsx(
              "block text-[9px] uppercase tracking-wide",
              variant === "dark" ? "text-white/70" : "text-ink-500"
            )}
          >
            Download on the
          </span>
          <span className="block text-sm font-semibold">App Store</span>
        </span>
      </a>
      <a href={site.playStore} className={badgeClasses}>
        <PlayCircle size={22} />
        <span className="text-left leading-tight">
          <span
            className={clsx(
              "block text-[9px] uppercase tracking-wide",
              variant === "dark" ? "text-white/70" : "text-ink-500"
            )}
          >
            Get it on
          </span>
          <span className="block text-sm font-semibold">Google Play</span>
        </span>
      </a>
    </div>
  );
}
