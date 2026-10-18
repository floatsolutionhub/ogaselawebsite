"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import clsx from "clsx";
import { Container } from "./Container";
import { GetAppButton } from "./GetAppButton";
import { Logo } from "./Logo";
import { primaryNavLinks } from "@/lib/site";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-ink-900/5 bg-surface/80 backdrop-blur-md">
      <Container className="flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <Logo size={40} />
          <span className="text-xl font-bold tracking-tight text-ink-900">Ogasela</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {primaryNavLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active ? "text-brand-700" : "text-ink-700 hover:text-brand-700"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full bg-brand-100"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <GetAppButton />
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink-900 lg:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </Container>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-ink-900/5 bg-surface lg:hidden"
          >
            <Container className="flex flex-col gap-1 py-4">
              {primaryNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={clsx(
                    "rounded-xl px-4 py-3 text-base font-medium",
                    pathname === link.href
                      ? "bg-brand-100 text-brand-700"
                      : "text-ink-700 hover:bg-ink-900/5"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <GetAppButton className="mt-2 w-full" onClick={() => setOpen(false)} />
            </Container>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
