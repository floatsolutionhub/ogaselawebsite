"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Ban, LoaderCircle, Lock, MessageCircle, PackageCheck, Phone } from "lucide-react";

import { recordCallClick, setBlocked, startChat } from "@/app/actions/listings";
import { useToast } from "@/components/providers/ToastProvider";
import { buttonClass } from "@/components/ui/styles";
import { OfficePickupDialog } from "./OfficePickupDialog";

/** Last 3 digits only until the buyer asks - a scraper reading the page gets nothing useful. */
function mask(phone: string) {
  return `${phone.slice(0, 4)} ••• ••${phone.slice(-3)}`;
}

/**
 * Message, Call and Request Office Pickup - the app's contact buttons. The API only returns the
 * seller's phone to signed-in users; signed-out visitors are sent to sign in and straight back.
 */
export function ContactSeller({
  listingId,
  listingTitle,
  sellerUserId,
  phone,
  signedIn,
  officePickup,
  blocked,
}: {
  listingId: string;
  listingTitle: string;
  sellerUserId: string;
  phone: string | null;
  signedIn: boolean;
  officePickup: boolean;
  blocked: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [revealed, setRevealed] = useState(false);
  const [pickupOpen, setPickupOpen] = useState(false);
  const [chatting, startChatting] = useTransition();
  const [unblocking, startUnblocking] = useTransition();
  const returnTo = `/listing/${listingId}`;

  if (!signedIn) {
    return (
      <div className="space-y-3">
        <Link href={`/sign-in?next=${encodeURIComponent(returnTo)}`} className={buttonClass("primary", "lg", "w-full")}>
          <Lock aria-hidden className="size-4" /> Sign in to contact seller
        </Link>
        <p className="text-center text-xs text-ink-500">Sellers&apos; numbers are only shown to signed-in buyers, to keep everyone safe.</p>
      </div>
    );
  }

  if (blocked) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-canvas px-4 py-3">
        <Ban aria-hidden className="size-5 shrink-0 text-ink-500" />
        <p className="flex-1 text-sm text-ink-500">You blocked this seller. Their ads are hidden and you can&apos;t contact each other.</p>
        <button
          type="button"
          disabled={unblocking}
          onClick={() =>
            startUnblocking(async () => {
              const result = await setBlocked(sellerUserId, false);
              if (result.ok) {
                toast.success("Seller unblocked");
                router.refresh();
              } else toast.error("Couldn't unblock this seller", result.error);
            })
          }
          className="text-sm font-semibold text-brand-700 hover:text-brand-600"
        >
          {unblocking ? "Unblocking…" : "Unblock"}
        </button>
      </div>
    );
  }

  const digits = phone?.replace(/[^\d+]/g, "") ?? "";

  return (
    <div className="grid gap-2.5">
      <button
        type="button"
        disabled={chatting}
        onClick={() =>
          startChatting(async () => {
            const result = await startChat(listingId);
            if (result.ok) router.push(`/messages/${result.data}`);
            else toast.error("Couldn't start a chat", result.error);
          })
        }
        className={buttonClass("primary", "lg", "w-full")}
      >
        {chatting ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : <MessageCircle aria-hidden className="size-4" />}
        Message
      </button>

      {!digits ? (
        <button
          type="button"
          onClick={() => {
            recordCallClick(listingId).catch(() => {});
            toast.info("This seller hasn't shared a phone number");
          }}
          className={buttonClass("outline", "lg", "w-full")}
        >
          <Phone aria-hidden className="size-4" /> Call
        </button>
      ) : revealed ? (
        <a href={`tel:${digits}`} className={buttonClass("outline", "lg", "w-full")}>
          <Phone aria-hidden className="size-4" /> Call {phone}
        </a>
      ) : (
        <button
          type="button"
          onClick={() => {
            setRevealed(true);
            recordCallClick(listingId).catch(() => {});
          }}
          className={buttonClass("outline", "lg", "w-full")}
        >
          <Phone aria-hidden className="size-4" /> Call · {mask(digits)}
        </button>
      )}

      {officePickup && (
        <>
          <button type="button" onClick={() => setPickupOpen(true)} className={buttonClass("gold", "lg", "w-full")}>
            <PackageCheck aria-hidden className="size-4" /> Request Office Pickup
          </button>
          <OfficePickupDialog open={pickupOpen} onClose={() => setPickupOpen(false)} listingId={listingId} listingTitle={listingTitle} />
        </>
      )}
    </div>
  );
}
