"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { CircleUser, Heart, House, MessageCircle, Plus } from "lucide-react";

import { useLive } from "@/components/providers/LiveProvider";

const TABS = [
  { href: "/", label: "Home", icon: House },
  { href: "/favourites", label: "Saved", icon: Heart },
  { href: "/sell", label: "Post", icon: Plus, primary: true },
  { href: "/messages", label: "Messages", icon: MessageCircle, badge: true },
  { href: "/account", label: "Profile", icon: CircleUser },
];

/** The app's tab bar, for phone-sized screens. */
export function MobileTabBar() {
  const pathname = usePathname();
  const { messages } = useLive();
  return (
    <nav
      aria-label="Quick"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-canvas-dark bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
    >
      <ul className="grid grid-cols-5">
        {TABS.map(({ href, label, icon: Icon, primary, badge }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium",
                  active ? "text-brand-700" : "text-ink-500",
                )}
              >
                {primary ? (
                  <span className="-mt-6 grid size-12 place-items-center rounded-full bg-gold-400 text-brand-900 shadow-lift ring-4 ring-white">
                    <Icon aria-hidden className="size-6" strokeWidth={2.5} />
                  </span>
                ) : (
                  <Icon aria-hidden className={clsx("size-[22px]", active && "fill-brand-100")} />
                )}
                {label}
                {badge && messages > 0 && (
                  <span className="absolute left-1/2 top-2 ml-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-clay px-1 text-[9px] font-bold text-white">
                    {messages > 99 ? "99+" : messages}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
