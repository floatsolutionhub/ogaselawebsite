"use client";

import Link from "next/link";
import { Bell, MessageCircle } from "lucide-react";

import { useLive } from "@/components/providers/LiveProvider";

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-clay px-1 text-[10px] font-bold text-white ring-2 ring-brand-700">
      {count > 99 ? "99+" : count}
    </span>
  );
}

/** Messages and notifications, with live unread badges (like the app's tab badge and bell). */
export function LiveLinks() {
  const { messages, notifications } = useLive();
  const iconLink = "relative grid size-10 place-items-center rounded-full text-white/90 hover:bg-white/10";
  return (
    <>
      <Link
        href="/messages"
        aria-label={messages > 0 ? `Messages, ${messages} unread` : "Messages"}
        className={`${iconLink} hidden sm:grid`}
      >
        <MessageCircle aria-hidden className="size-5" />
        <Badge count={messages} />
      </Link>
      <Link
        href="/notifications"
        aria-label={notifications > 0 ? `Notifications, ${notifications} unread` : "Notifications"}
        className={iconLink}
      >
        <Bell aria-hidden className="size-5" />
        <Badge count={notifications} />
      </Link>
    </>
  );
}
