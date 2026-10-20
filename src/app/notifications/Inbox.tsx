"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import clsx from "clsx";
import {
  BadgeCheck,
  Bell,
  CircleAlert,
  CircleCheck,
  Clock,
  EyeOff,
  FileCheck,
  FileX,
  MessageCircle,
  PackageCheck,
  Scale,
  ShieldCheck,
  Star,
  UserCheck,
  UserX,
  type LucideIcon,
} from "lucide-react";

import { loadInbox, markAllNotificationsRead, markNotificationRead } from "@/app/actions/inbox";
import { EmptyState } from "@/components/market/Badges";
import { useLive } from "@/components/providers/LiveProvider";
import type { InboxNotification, InboxPage } from "@/lib/api/types";
import { timeAgo } from "@/lib/format";

const STYLE: Record<string, { icon: LucideIcon; className: string }> = {
  AdApproved: { icon: CircleCheck, className: "bg-brand-50 text-brand-600" },
  AdRejected: { icon: CircleAlert, className: "bg-danger/10 text-danger" },
  AdExpiringSoon: { icon: Clock, className: "bg-gold-50 text-gold-700" },
  AdExpired: { icon: Clock, className: "bg-canvas text-ink-500" },
  NewMessage: { icon: MessageCircle, className: "bg-brand-50 text-brand-600" },
  DisputeOpened: { icon: Scale, className: "bg-danger/10 text-danger" },
  DisputeUpdate: { icon: Scale, className: "bg-gold-50 text-gold-700" },
  DisputeResolved: { icon: Scale, className: "bg-brand-50 text-brand-600" },
  OfficePickupUpdate: { icon: PackageCheck, className: "bg-brand-50 text-brand-600" },
  NewReview: { icon: Star, className: "bg-gold-50 text-gold-600" },
  Verification: { icon: ShieldCheck, className: "bg-brand-50 text-brand-600" },
  DocumentApproved: { icon: FileCheck, className: "bg-brand-50 text-brand-600" },
  DocumentRejected: { icon: FileX, className: "bg-danger/10 text-danger" },
  ProfileChangeApproved: { icon: UserCheck, className: "bg-brand-50 text-brand-600" },
  ProfileChangeRejected: { icon: UserX, className: "bg-danger/10 text-danger" },
  AdTakenDown: { icon: EyeOff, className: "bg-danger/10 text-danger" },
  AdReinstated: { icon: CircleCheck, className: "bg-brand-50 text-brand-600" },
};

/** Where tapping a notification goes - the same routing as the app's notifications screen. */
function destination(item: InboxNotification): string | null {
  switch (item.type) {
    case "NewMessage":
      return item.conversationId ? `/messages/${item.conversationId}` : "/messages";
    case "DisputeOpened":
    case "DisputeUpdate":
    case "DisputeResolved":
      return item.disputeId ? `/disputes/${item.disputeId}` : "/disputes";
    case "OfficePickupUpdate":
      return item.officePickupId ? `/office-pickups/${item.officePickupId}` : "/office-pickups";
    case "AdRejected":
      // My ads shows the rejected ad in Drafts with the moderator's reason.
      return "/my-ads?tab=draft";
    case "Verification":
      return "/account";
    case "DocumentApproved":
    case "DocumentRejected":
      return "/account/personal";
    case "ProfileChangeApproved":
    case "ProfileChangeRejected":
      return "/account/settings";
    default:
      return item.listingId ? `/listing/${item.listingId}` : null;
  }
}

export function Inbox({ initial }: { initial: InboxPage | null }) {
  const router = useRouter();
  const { setCounts } = useLive();
  const [items, setItems] = useState(initial?.items ?? []);
  const [total, setTotal] = useState(initial?.totalCount ?? 0);
  const [unread, setUnread] = useState(initial?.unreadCount ?? 0);
  const [page, setPage] = useState(1);
  const [loading, startLoading] = useTransition();

  const open = (item: InboxNotification) => {
    if (!item.isRead) {
      markNotificationRead(item.id).catch(() => {});
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)));
      const next = Math.max(0, unread - 1);
      setUnread(next);
      setCounts({ notifications: next });
    }
    const href = destination(item);
    if (href) router.push(href);
  };

  const markAll = () => {
    markAllNotificationsRead().catch(() => {});
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
    setCounts({ notifications: 0 });
  };

  const loadMore = () =>
    startLoading(async () => {
      const result = await loadInbox(page + 1);
      if (!result.ok) return;
      setPage(page + 1);
      setTotal(result.data.totalCount);
      setItems((prev) => {
        const seen = new Set(prev.map((n) => n.id));
        return [...prev, ...result.data.items.filter((n) => !seen.has(n.id))];
      });
    });

  return (
    <>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">What&apos;s new</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-[28px]">Notifications</h1>
        </div>
        {unread > 0 && (
          <button type="button" onClick={markAll} className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100">
            <BadgeCheck aria-hidden className="size-4" /> Mark all read
          </button>
        )}
      </div>

      {!initial ? (
        <EmptyState icon={Bell} title="We couldn't load your notifications">
          Please refresh the page in a moment.
        </EmptyState>
      ) : items.length === 0 ? (
        <EmptyState icon={Bell} title="You're all caught up">
          Ad approvals, messages and reviews will show up here.
        </EmptyState>
      ) : (
        <>
          <ul className="space-y-2.5">
            {items.map((item) => {
              const style = STYLE[item.type] ?? { icon: Bell, className: "bg-canvas text-ink-700" };
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => open(item)}
                    className={clsx(
                      "flex w-full items-start gap-3 rounded-2xl p-4 text-left ring-1 transition hover:shadow-card",
                      item.isRead ? "bg-white ring-canvas-dark/60" : "bg-brand-50/60 ring-brand-100",
                    )}
                  >
                    <span className={clsx("grid size-10 shrink-0 place-items-center rounded-full", style.className)}>
                      <style.icon aria-hidden className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-3">
                        <span className="font-semibold">
                          {item.title}
                          {item.count > 1 && <span className="ml-1.5 text-sm font-normal text-ink-500">({item.count})</span>}
                        </span>
                        <span className="shrink-0 text-xs text-ink-500">{timeAgo(item.updatedAt)}</span>
                      </span>
                      <span className="mt-0.5 line-clamp-3 block text-sm text-ink-700">{item.body}</span>
                    </span>
                    {!item.isRead && <span aria-label="Unread" className="mt-2 size-2.5 shrink-0 rounded-full bg-clay" />}
                  </button>
                </li>
              );
            })}
          </ul>
          {items.length < total && (
            <div className="mt-6 text-center">
              <button type="button" onClick={loadMore} disabled={loading} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 shadow-card ring-1 ring-canvas-dark/60">
                {loading ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
