"use client";

import { Heart, Mail, ShieldCheck } from "lucide-react";
import { site } from "@/lib/marketing/site";
import { useLaunch } from "./LaunchProvider";

export function DonateOptions() {
  const { donationUrl } = useLaunch();

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-ink-500">
        Every marketplace started with someone willing to bet on it early. We&apos;re building
        Ogasela from the ground up for the market woman in Alaba, the mechanic in Aba, the
        student hustling in Nsukka. Your support keeps the servers running and the dream moving.
        No amount is too small.
      </p>

      {donationUrl ? (
        <>
          <a
            href={donationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full bg-gold-400 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-gold-500/25 transition-transform hover:-translate-y-0.5"
          >
            <Heart size={18} /> Donate via Paystack
          </a>

          <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-300">
            <ShieldCheck size={14} className="mt-0.5 flex-shrink-0 text-brand-500" />
            You&apos;ll be taken to our secure Paystack page to give by card, bank transfer or USSD.
            Ogasela never sees your card details. Donations are voluntary gifts: they don&apos;t buy
            shares, rewards or services, and aren&apos;t refundable except where the law requires.
          </p>
        </>
      ) : (
        <div className="rounded-2xl bg-surface p-5 text-sm text-ink-500">
          <p className="font-semibold text-ink-900">Our donation page is opening soon.</p>
          <p className="mt-1">
            Want to support us before then? Email{" "}
            <a
              href={`mailto:${site.supportEmail}?subject=${encodeURIComponent("Supporting Ogasela")}`}
              className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline"
            >
              <Mail size={14} /> {site.supportEmail}
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
}
