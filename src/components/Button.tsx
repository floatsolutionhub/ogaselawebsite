import Link from "next/link";
import { ReactNode } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700 active:bg-brand-800",
  secondary:
    "bg-white text-brand-700 border border-brand-200 hover:border-brand-400 hover:bg-brand-50",
  ghost: "text-ink-900 hover:bg-ink-900/5",
};

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

export function Button({
  children,
  variant = "primary",
  className,
  href,
  onClick,
  type = "button",
}: CommonProps & {
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const classes = clsx(
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 ease-out",
    variantClasses[variant],
    className
  );

  // Off-site links (stores, Paystack) open in a new tab; on-site ones use client-side navigation.
  if (href && /^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} onClick={onClick}>
        {children}
      </a>
    );
  }

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
