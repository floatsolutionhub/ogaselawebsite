import clsx from "clsx";

// Shared class recipes, so buttons and inputs look the same on every page.

type Variant = "primary" | "gold" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-900/10",
  gold: "bg-gold-400 text-brand-900 hover:bg-gold-300 shadow-sm shadow-gold-800/20",
  outline: "border border-brand-200 bg-white text-brand-700 hover:border-brand-400 hover:bg-brand-50",
  ghost: "text-ink-700 hover:bg-brand-50 hover:text-brand-700",
  danger: "border border-danger/30 bg-white text-danger hover:bg-danger/5",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-7 text-base gap-2",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return clsx(
    "inline-flex items-center justify-center rounded-full font-semibold transition-colors duration-150",
    "disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    sizes[size],
    className,
  );
}

export const inputClass = clsx(
  "w-full rounded-xl border border-ink-300/50 bg-white px-4 py-3 text-[15px] text-ink-900",
  "placeholder:text-ink-300 transition-colors",
  "hover:border-brand-300 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100",
  "aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/15",
);

export const cardClass = "rounded-2xl border border-canvas-dark/60 bg-white shadow-card";
