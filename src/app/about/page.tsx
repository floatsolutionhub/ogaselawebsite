import type { Metadata } from "next";
import { Heart, Handshake, ShieldCheck, Sparkle } from "lucide-react";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/FadeIn";
import { CtaBanner } from "@/components/sections/CtaBanner";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Ogasela is on a mission to make buying and selling effortless for every Nigerian, in every city.",
};

const values = [
  {
    icon: Handshake,
    title: "Community first",
    description:
      "We're building for the trader in Alaba, the student in Nsukka, and the hustler in Port Harcourt — not just big cities.",
  },
  {
    icon: ShieldCheck,
    title: "Trust by design",
    description:
      "Verification, in-app chat, and secure payments exist so you can transact with confidence, every time.",
  },
  {
    icon: Sparkle,
    title: "Simple, always",
    description:
      "Listing an item or finding a deal should take minutes, not hours. We obsess over removing friction.",
  },
  {
    icon: Heart,
    title: "Made in Nigeria, for Nigeria",
    description:
      "From Naira-first pricing to state-by-state discovery, Ogasela is built around how Nigerians actually buy and sell.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="A marketplace built around how Nigerians actually trade"
        description="Ogasela started with a simple question: why should finding a trusted buyer or seller near you be so hard? We're fixing that, one listing at a time."
      />

      <section className="py-20">
        <Container className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              Our story
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900">
              From market stalls to your pocket
            </h2>
            <div className="mt-5 space-y-4 text-ink-500 leading-relaxed">
              <p>
                Nigeria has always had thriving marketplaces — from Balogun to Computer
                Village, from Alaba International to Onitsha Main Market. What we didn&apos;t
                have was a single, trustworthy place to bring that energy online, built
                specifically for how Nigerians shop and sell.
              </p>
              <p>
                Ogasela is our answer: a mobile-first marketplace where anyone can list an item
                in minutes, chat directly with real buyers nearby, and get paid safely —
                without the clutter, scams, or middlemen that make online trading a headache
                elsewhere.
              </p>
              <p>
                We&apos;re just getting started, and we&apos;re building it with the community
                that will use it every day.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl bg-brand-600 p-8 text-white">
                <p className="text-3xl font-extrabold">36+1</p>
                <p className="mt-1 text-sm text-brand-100">States &amp; FCT covered</p>
              </div>
              <div className="mt-8 rounded-3xl bg-gold-400 p-8 text-white">
                <p className="text-3xl font-extrabold">100%</p>
                <p className="mt-1 text-sm text-white/90">Free to list</p>
              </div>
              <div className="rounded-3xl bg-ink-900 p-8 text-white">
                <p className="text-3xl font-extrabold">24/7</p>
                <p className="mt-1 text-sm text-white/70">In-app messaging</p>
              </div>
              <div className="mt-8 rounded-3xl border border-brand-200 bg-brand-50 p-8">
                <p className="text-3xl font-extrabold text-brand-700">KYC</p>
                <p className="mt-1 text-sm text-brand-600">Verified sellers</p>
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="bg-white py-20">
        <Container>
          <FadeIn className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              What we stand for
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              Our values
            </h2>
          </FadeIn>

          <StaggerGroup className="mt-14 grid gap-6 sm:grid-cols-2">
            {values.map((value) => (
              <StaggerItem key={value.title}>
                <div className="flex gap-4 rounded-2xl bg-surface p-6">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                    <value.icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-ink-900">{value.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
                      {value.description}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>

      <CtaBanner />
    </>
  );
}
