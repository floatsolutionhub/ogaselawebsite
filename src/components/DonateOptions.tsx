import { Heart, ShieldCheck } from "lucide-react";
import { site } from "@/lib/site";

export function DonateOptions() {
  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-ink-500">
        Every marketplace started with someone willing to bet on it early. We&apos;re building
        Ogasela from the ground up — for the market woman in Alaba, the mechanic in Aba, the
        student hustling in Nsukka. Your support keeps the servers running and the dream moving.
        No amount is too small — and every naira goes straight into building something
        Nigeria can be proud of.
      </p>

      <a
        href={site.donationUrl}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2 rounded-full bg-gold-400 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-gold-500/25 transition-transform hover:-translate-y-0.5"
      >
        <Heart size={18} /> Donate via Flutterwave
      </a>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-300">
        <ShieldCheck size={14} className="mt-0.5 flex-shrink-0 text-brand-500" />
        You&apos;ll be taken to Flutterwave&apos;s secure donation page to complete your gift by
        card, bank transfer, or USSD.
      </p>
    </div>
  );
}
