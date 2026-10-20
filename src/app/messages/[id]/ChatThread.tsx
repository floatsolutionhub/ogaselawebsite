"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useTransition } from "react";
import clsx from "clsx";
import { Ban, ChevronLeft, LoaderCircle, PackageCheck, Scale, Send, ShieldAlert, UserX } from "lucide-react";

import { setBlocked } from "@/app/actions/listings";
import { getUnreadCounts, loadMessages, markChatRead, sendChatMessage } from "@/app/actions/messages";
import { OfficePickupDialog } from "@/components/listing/OfficePickupDialog";
import { useLive } from "@/components/providers/LiveProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Dialog } from "@/components/ui/Dialog";
import { buttonClass } from "@/components/ui/styles";
import type { Conversation, Message } from "@/lib/api/types";
import { formatNaira, safeHttpUrl } from "@/lib/format";

const time = new Intl.DateTimeFormat("en-NG", { hour: "numeric", minute: "2-digit", timeZone: "Africa/Lagos" });
const day = new Intl.DateTimeFormat("en-NG", { weekday: "short", day: "numeric", month: "short", timeZone: "Africa/Lagos" });

export function ChatThread({
  conversation: initialConversation,
  viewerId,
  listing,
  initialMessages,
  hasMore: initialHasMore,
  safetyNotice,
  officePickup,
}: {
  conversation: Conversation;
  viewerId: string;
  listing: { id: string; title: string; price: number | null; image: string | null };
  initialMessages: Message[];
  hasMore: boolean;
  safetyNotice: string;
  officePickup: boolean;
}) {
  const toast = useToast();
  const { onMessage, setCounts } = useLive();
  const [conversation, setConversation] = useState(initialConversation);
  const [messages, setMessages] = useState(initialMessages);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState("");
  const [sending, startSending] = useTransition();
  const [loadingOlder, startLoadingOlder] = useTransition();
  const [blocking, startBlocking] = useTransition();
  const [confirmBlock, setConfirmBlock] = useState(false);
  const [pickupOpen, setPickupOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  const append = useCallback((message: Message) => {
    setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
  }, []);

  // Opening the thread read its messages - bring the badge down straight away.
  const refreshCounts = useCallback(() => {
    getUnreadCounts().then((counts) => counts && setCounts(counts)).catch(() => {});
  }, [setCounts]);
  useEffect(refreshCounts, [refreshCounts]);

  useEffect(
    () =>
      onMessage((message) => {
        if (message.conversationId !== conversation.id) return;
        stickToBottom.current = true;
        append(message);
        // Seen as it arrived - mark it read so it doesn't count towards the badge.
        markChatRead(conversation.id).then(refreshCounts).catch(() => {});
      }),
    [onMessage, conversation.id, append, refreshCounts],
  );

  // Keep the newest message in view unless the reader scrolled up to older ones.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (list && stickToBottom.current) list.scrollTop = list.scrollHeight;
  }, [messages]);

  const send = () => {
    const content = draft.trim();
    if (!content || sending) return;
    setDraft("");
    startSending(async () => {
      const result = await sendChatMessage(conversation.id, content);
      if (result.ok) {
        stickToBottom.current = true;
        append(result.data);
      } else {
        setDraft(content);
        toast.error("Message not sent", result.error);
      }
    });
  };

  const loadOlder = () =>
    startLoadingOlder(async () => {
      const result = await loadMessages(conversation.id, page + 1);
      if (!result.ok) {
        toast.error("Couldn't load earlier messages", result.error);
        return;
      }
      stickToBottom.current = false;
      setPage((p) => p + 1);
      setHasMore(result.data.hasMore);
      setMessages((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        return [...result.data.items.filter((m) => !seen.has(m.id)), ...prev];
      });
    });

  const changeBlock = (block: boolean) =>
    startBlocking(async () => {
      const result = await setBlocked(conversation.otherParticipantId, block);
      setConfirmBlock(false);
      if (!result.ok) {
        toast.error(block ? "Couldn't block this user" : "Couldn't unblock this user", result.error);
        return;
      }
      setConversation((c) => ({ ...c, isBlockedByMe: block }));
      toast.success(
        block ? "User blocked" : "User unblocked",
        block ? "They can no longer message you. Unblock them any time in Settings." : "You can message each other again.",
      );
    });

  const image = safeHttpUrl(listing.image);
  const days = messages.map((m) => day.format(new Date(m.sentAt)));

  return (
    <div className="mx-auto flex h-[calc(100dvh-88px-64px)] max-w-3xl flex-col sm:h-[calc(100dvh-88px)] sm:py-6">
      <div className="flex flex-1 flex-col overflow-hidden bg-white sm:rounded-3xl sm:shadow-card sm:ring-1 sm:ring-canvas-dark/60">
        {/* Header: the ad this chat is about, and the dispute / block actions. */}
        <div className="flex items-center gap-3 border-b border-canvas-dark/60 px-4 py-3">
          <Link href="/messages" aria-label="Back to messages" className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-canvas">
            <ChevronLeft aria-hidden className="size-5" />
          </Link>
          <Link href={`/listing/${listing.id}`} className="flex min-w-0 flex-1 items-center gap-3">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" referrerPolicy="no-referrer" className="size-11 shrink-0 rounded-xl object-cover" />
            ) : (
              <span className="size-11 shrink-0 rounded-xl bg-brand-50" />
            )}
            <span className="min-w-0">
              <span className="block truncate font-semibold">{listing.title}</span>
              <span className="text-sm text-ink-500">
                {formatNaira(listing.price)} · {viewerId === conversation.buyerId ? "you're buying" : "you're selling"}
              </span>
            </span>
          </Link>
          <Link
            href={`/disputes/new?listingId=${listing.id}&conversationId=${conversation.id}`}
            className="hidden items-center gap-1.5 rounded-full border border-canvas-dark px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-canvas sm:inline-flex"
          >
            <Scale aria-hidden className="size-3.5" /> Dispute
          </Link>
          {!conversation.isOtherParticipantDeleted && (
            <button
              type="button"
              disabled={blocking}
              onClick={() => (conversation.isBlockedByMe ? changeBlock(false) : setConfirmBlock(true))}
              className="inline-flex items-center gap-1.5 rounded-full border border-danger/25 px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger/5"
            >
              <Ban aria-hidden className="size-3.5" /> {conversation.isBlockedByMe ? "Unblock" : "Block"}
            </button>
          )}
        </div>

        {/* Messages */}
        <div
          ref={listRef}
          onScroll={(event) => {
            const el = event.currentTarget;
            stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
          }}
          className="woven flex-1 overflow-y-auto px-4 py-4"
          aria-live="polite"
        >
          {hasMore && (
            <div className="mb-4 text-center">
              <button type="button" onClick={loadOlder} disabled={loadingOlder} className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-brand-700 shadow-sm">
                {loadingOlder ? "Loading…" : "Load earlier messages"}
              </button>
            </div>
          )}
          {messages.length === 0 ? (
            <p className="mt-16 text-center text-sm text-ink-500">No messages yet. Say hello!</p>
          ) : (
            <ul className="space-y-2.5">
              {messages.map((message, index) => {
                const own = message.senderId === viewerId;
                const sentDay = days[index];
                const showDay = index === 0 || sentDay !== days[index - 1];
                return (
                  <li key={message.id}>
                    {showDay && (
                      <p className="my-3 text-center text-[11px] font-semibold uppercase tracking-wider text-ink-500">{sentDay}</p>
                    )}
                    <div className={clsx("flex flex-col", own ? "items-end" : "items-start")}>
                      <div
                        className={clsx(
                          "max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-[15px] leading-6 shadow-sm",
                          own ? "rounded-br-md bg-brand-600 text-white" : "rounded-bl-md bg-white text-ink-900 ring-1 ring-canvas-dark/60",
                        )}
                      >
                        {message.content}
                      </div>
                      <span className="mt-1 px-1 text-[11px] text-ink-500">{time.format(new Date(message.sentAt))}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Safety notice, office pickup prompt, and the message box. */}
        <div className="border-t border-canvas-dark/60 bg-white px-4 pt-3">
          <p role="note" className="flex items-start gap-2 rounded-xl bg-gold-50 px-3 py-2 text-xs font-medium text-ink-900 ring-1 ring-gold-200">
            <ShieldAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-700" /> {safetyNotice}
          </p>
          {officePickup && !conversation.isBlockedByMe && !conversation.isOtherParticipantDeleted && (
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-brand-50 py-1.5 pl-3 pr-1.5 ring-1 ring-brand-100">
              <PackageCheck aria-hidden className="size-4 text-brand-600" />
              <span className="flex-1 text-xs font-medium">Want office pickup?</span>
              <button type="button" onClick={() => setPickupOpen(true)} className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-500">
                Send Request
              </button>
            </div>
          )}
        </div>
        {conversation.isOtherParticipantDeleted ? (
          <div role="note" className="m-4 flex items-center gap-3 rounded-2xl bg-canvas px-4 py-3">
            <UserX aria-hidden className="size-5 shrink-0 text-ink-500" />
            <p className="flex-1 text-sm text-ink-500">
              This account was deleted. The chat is kept here for your reference, but no new messages can be sent.
            </p>
          </div>
        ) : conversation.isBlockedByMe ? (
          <div className="m-4 flex items-center gap-3 rounded-2xl bg-canvas px-4 py-3">
            <Ban aria-hidden className="size-5 text-ink-500" />
            <p className="flex-1 text-sm text-ink-500">You blocked this user. Neither of you can send messages in this chat.</p>
            <button type="button" onClick={() => changeBlock(false)} disabled={blocking} className="text-sm font-semibold text-brand-700">
              Unblock
            </button>
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              send();
            }}
            className="flex items-end gap-2 px-4 py-3"
          >
            <label htmlFor="chat-input" className="sr-only">
              Type a message
            </label>
            <textarea
              id="chat-input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send();
                }
              }}
              rows={1}
              maxLength={4000}
              placeholder="Type a message"
              className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-ink-300/50 bg-surface px-4 py-2.5 text-[15px] focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
            />
            <button
              type="submit"
              disabled={!draft.trim() || sending}
              aria-label="Send"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-600 text-white transition hover:bg-brand-500 disabled:opacity-50"
            >
              {sending ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : <Send aria-hidden className="size-5" />}
            </button>
          </form>
        )}
      </div>

      <Dialog
        open={confirmBlock}
        onClose={() => setConfirmBlock(false)}
        size="sm"
        title="Block this user?"
        description="They won't be able to message you or start new chats with you. You can unblock them any time in Settings › Blocked users."
        footer={
          <div className="flex gap-2">
            <button type="button" onClick={() => setConfirmBlock(false)} className={buttonClass("outline", "md", "flex-1")}>
              Cancel
            </button>
            <button type="button" onClick={() => changeBlock(true)} disabled={blocking} className={buttonClass("danger", "md", "flex-1")}>
              Block
            </button>
          </div>
        }
      />
      {officePickup && (
        <OfficePickupDialog open={pickupOpen} onClose={() => setPickupOpen(false)} listingId={listing.id} listingTitle={listing.title} />
      )}
    </div>
  );
}
