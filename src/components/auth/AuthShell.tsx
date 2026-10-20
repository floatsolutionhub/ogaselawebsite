import Image from "next/image";
import { BadgeCheck, MapPin, ShieldCheck } from "lucide-react";

import { Container } from "@/components/Container";

/** Split layout for the sign-in screens: the form, and a market-square panel beside it. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <Container className="py-8 sm:py-14">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-lift ring-1 ring-canvas-dark/60 lg:grid-cols-[1fr_1.05fr]">
        <div className="px-6 py-10 sm:px-12 sm:py-14">
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-ink-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>

        <div className="relative hidden min-h-[560px] lg:block">
          <Image src="/images/electronics-store.jpg" alt="" fill sizes="520px" className="object-cover" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/70 to-brand-800/20" />
          <div aria-hidden className="awning absolute inset-x-0 top-0 h-5" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-white">
            <p className="text-2xl font-bold leading-snug">
              Your stall in Nigeria&apos;s
              <span className="block text-gold-400">biggest market square.</span>
            </p>
            <ul className="mt-6 space-y-3 text-sm text-brand-100">
              <li className="flex items-center gap-2.5">
                <ShieldCheck aria-hidden className="size-5 text-gold-400" /> Two-step sign-in on every login
              </li>
              <li className="flex items-center gap-2.5">
                <BadgeCheck aria-hidden className="size-5 text-gold-400" /> Verified sellers you can trust
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin aria-hidden className="size-5 text-gold-400" /> Deals from your own neighbourhood
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Container>
  );
}
