import Image from "next/image";
import { BadgeCheck } from "lucide-react";

import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { GetAppButton } from "@/components/GetAppButton";
import { StoreBadges } from "@/components/StoreBadges";
import { AnnouncementPopup } from "@/components/home/AnnouncementPopup";
import { ComingSoon } from "@/components/home/ComingSoon";
import { Testimonials } from "@/components/home/Testimonials";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { Faqs } from "@/components/sections/Faqs";
import { Features } from "@/components/sections/Features";
import { GetInvolved } from "@/components/sections/GetInvolved";
import { HowItWorks } from "@/components/sections/HowItWorks";

/** The product's homepage. Browsing, searching, buying and selling all happen in the app. */
export default function HomePage() {
  return (
    <>
      <AnnouncementPopup />
      <Hero />
      {/* #how-it-works, #get-involved, #faqs and #download are linked to from elsewhere. */}
      <HowItWorks />
      <Features />
      <Testimonials />
      <ComingSoon />
      <GetInvolved />
      <Faqs />
      <CtaBanner />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-x-clip bg-brand-800 text-white">
      <Image
        src="/images/market-square.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-35 mix-blend-luminosity"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-brand-900/95 via-brand-800/80 to-brand-700/40" />
      <div aria-hidden className="ankara absolute -right-24 top-10 hidden size-80 rotate-12 rounded-[3rem] opacity-30 lg:block" />

      <Container className="relative grid items-center gap-10 pb-24 pt-14 sm:pb-28 sm:pt-20 lg:grid-cols-[1.25fr_1fr]">
        <div className="animate-rise relative z-20">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-300 ring-1 ring-white/15">
            <span className="size-1.5 rounded-full bg-gold-400" /> The market is open
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
            Nigeria&apos;s market square,
            <span className="block text-gold-400">right in your hand.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-brand-100 sm:text-lg">
            Buy and sell anything, from anyone, near you. Verified sellers, honest prices and no wahala,
            just like your favourite market, without the traffic.
          </p>

          <div className="mt-8 max-w-xl">
            <div className="flex flex-col gap-3 sm:flex-row">
              <GetAppButton variant="secondary" className="px-8 py-4 text-base" />
              <Button href="/how-it-works" variant="ghost" className="px-8 py-4 text-base text-white ring-1 ring-white/30 hover:bg-white/10">
                See how it works
              </Button>
            </div>
            <div className="mt-7 flex-wrap items-center gap-x-4 gap-y-3 border-t border-white/15 pt-6">
              <StoreBadges />
            </div>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="relative ml-auto aspect-[4/5] w-80 overflow-hidden rounded-[2rem] shadow-2xl ring-4 ring-white/10">
            <Image src="/images/women-market.jpg" alt="Traders at a busy Nigerian market" fill sizes="320px" className="object-cover" />
          </div>
          <div className="absolute -left-2 bottom-10 flex items-center gap-3 rounded-2xl bg-white p-3.5 pr-5 text-ink-900 shadow-lift">
            <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <BadgeCheck aria-hidden className="size-6" />
            </span>
            <span className="text-sm leading-tight">
              <span className="block font-semibold">Verified sellers</span>
              <span className="text-ink-500">ID-checked, face-matched</span>
            </span>
          </div>
          <div className="absolute -right-3 top-8 rotate-6">
            <span className="price-tag inline-block rounded-r-lg py-2 pr-4 text-lg font-extrabold shadow-lift">Best price</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
