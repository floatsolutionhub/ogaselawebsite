"use client";

import { useState } from "react";
import { Headset, MessageCircle, Phone } from "lucide-react";

import { Dialog } from "@/components/ui/Dialog";

/** The app's floating support button (signed-in users): WhatsApp and phone, whichever are set. */
export function SupportButton({ phone, whatsappUrl }: { phone: string; whatsappUrl: string }) {
  const [open, setOpen] = useState(false);
  const row = "flex items-center gap-4 rounded-2xl p-3 ring-1 ring-canvas-dark/70 transition hover:bg-brand-50";
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Get help"
        className="fixed bottom-40 right-4 z-30 grid size-14 place-items-center rounded-full bg-brand-600 text-white shadow-lift transition hover:bg-brand-500 sm:bottom-28 sm:right-6"
      >
        <Headset aria-hidden className="size-6" />
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Need help?" description="Reach the Ogasela support team on any of these channels." size="sm">
        <div className="space-y-3">
          {whatsappUrl && (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={row}>
              <span className="grid size-11 place-items-center rounded-full bg-[#25D366] text-white">
                <MessageCircle aria-hidden className="size-5" />
              </span>
              <span>
                <span className="block font-semibold">Chat on WhatsApp</span>
                <span className="text-sm text-ink-500">Usually the fastest way to reach us</span>
              </span>
            </a>
          )}
          {phone && (
            <a href={`tel:${phone}`} className={row}>
              <span className="grid size-11 place-items-center rounded-full bg-brand-600 text-white">
                <Phone aria-hidden className="size-5" />
              </span>
              <span>
                <span className="block font-semibold">Call support</span>
                <span className="text-sm text-ink-500">{phone}</span>
              </span>
            </a>
          )}
          {!phone && !whatsappUrl && <p className="text-sm text-ink-500">Support contacts aren&apos;t set up yet.</p>}
        </div>
      </Dialog>
    </>
  );
}
