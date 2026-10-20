import type { Metadata } from "next";
import Link from "next/link";
import {
  Banknote,
  Compass,
  Eye,
  Handshake,
  Heart,
  CheckCircle2,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Sparkle,
  Store,
  Target,
} from "lucide-react";
import { Container } from "@/components/site/Container";
import { PageHeader } from "@/components/site/PageHeader";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/site/FadeIn";
import { CtaBanner } from "@/components/site/sections/CtaBanner";
import { site } from "@/lib/marketing/site";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Who we are, what we're building and why: Ogasela's vision, mission, objectives and how we operate.",
};

const objectives = [
  "Give every seller, from a market stall to a growing business, a free way to reach buyers in their own city.",
  "Make it normal to check who you're dealing with, through seller verification, reviews and in-app chat.",
  "Take the risk out of paying for things you haven't seen, with Office Pickup and inspection at our branches.",
  "Cover all 36 states and the FCT, so a buyer in Jos is as well served as one in Lekki.",
  "Put simple AI tools in every seller's hands, so a great ad doesn't depend on being a great copywriter.",
  "Earn trust by being open about fees, protecting personal data and resolving problems fairly.",
];

const valueForSellers = [
  "Post for free, and only pay for more reach if you want it",
  "No commission on deals you close directly with buyers",
  "AI help with descriptions, pricing and photos",
  "A verified badge and reviews that build your reputation",
  "Promotion on TikTok and Facebook from inside the app",
  "Insights on views, saves and messages for every ad",
];

const valueForBuyers = [
  "Everything for sale near you, sorted by state and city",
  "Verified sellers and honest reviews before you commit",
  "Chat in the app without giving out your number",
  "Office Pickup: pay Ogasela, we inspect it, you collect it",
  "Report, dispute and get help from a real team",
  "Free to browse, free to message",
];

const operations = [
  {
    icon: Store,
    title: "Free listings, paid reach",
    description:
      "Anyone verified can post on the Free plan. Sellers who want more photos, a longer run or a higher spot in search choose a Basic, Standard or Premium plan, paid by card, bank transfer or USSD through Paystack.",
  },
  {
    icon: PackageCheck,
    title: "Office Pickup",
    description:
      "For eligible categories, buyers can pay Ogasela the item price plus a 3% service fee. Sellers drop the item at an Ogasela branch, our staff inspect it, and the buyer collects it or has it delivered.",
  },
  {
    icon: ShieldCheck,
    title: "A team behind the app",
    description:
      "Our staff review seller verification documents and ads, investigate reports, work disputes through to resolution, and run our pickup branches. Software flags the risks; people make the calls.",
  },
  {
    icon: Banknote,
    title: "How we make money",
    description:
      "From optional ad plans and promotions, and the Office Pickup service fee. We don't take a cut of deals you make directly, and we never sell your personal data.",
  },
];

const values = [
  {
    icon: Handshake,
    title: "Community first",
    description:
      "We're building for the trader in Alaba, the student in Nsukka and the hustler in Port Harcourt, not just the big cities.",
  },
  {
    icon: ShieldCheck,
    title: "Trust by design",
    description:
      "Verification, in-app chat, inspection and a real support team exist so you can transact with confidence.",
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
      "From Naira pricing to state-by-state discovery, Ogasela is built around how Nigerians actually buy and sell.",
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
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Who we are</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900">
              From market stalls to your pocket
            </h2>
            <div className="mt-5 space-y-4 leading-relaxed text-ink-500">
              <p>
                Ogasela is a product of {site.legalName}, a Nigerian technology company based in
                Lagos. It&apos;s a mobile marketplace where anyone can buy and sell almost anything: phones and gadgets,
                fashion, furniture, vehicles, property, jobs and services, with people near them.
              </p>
              <p>
                Nigeria has always had thriving markets, from Balogun to Computer Village, from
                Alaba International to Onitsha Main Market. What it hasn&apos;t had is a single,
                trustworthy place to bring that energy online. Too often, buying from a stranger
                online means paying up front and hoping for the best.
              </p>
              <p>
                So we built Ogasela around trust: verified sellers, conversations that stay in the
                app, a team that reviews ads and handles disputes, and Office Pickup, where we hold
                the item and check it before you take it home.
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
                <p className="text-3xl font-extrabold">₦0</p>
                <p className="mt-1 text-sm text-white/90">To post on the Free plan</p>
              </div>
              <div className="rounded-3xl bg-ink-900 p-8 text-white">
                <p className="text-3xl font-extrabold">0%</p>
                <p className="mt-1 text-sm text-white/70">Commission on direct deals</p>
              </div>
              <div className="mt-8 rounded-3xl border border-brand-200 bg-brand-50 p-8">
                <p className="text-3xl font-extrabold text-brand-700">ID + face</p>
                <p className="mt-1 text-sm text-brand-600">Seller verification</p>
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="bg-white py-20">
        <Container className="grid gap-6 md:grid-cols-2">
          <FadeIn>
            <div className="h-full rounded-3xl bg-brand-900 p-8 text-white sm:p-10">
              <Eye size={26} className="text-gold-300" />
              <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-brand-300">Our vision</p>
              <p className="mt-3 text-2xl font-bold leading-snug">
                A Nigeria where anyone can buy or sell anything, with anyone nearby, and trust
                the deal.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="h-full rounded-3xl bg-surface p-8 sm:p-10">
              <Compass size={26} className="text-brand-600" />
              <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-brand-600">Our mission</p>
              <p className="mt-3 text-2xl font-bold leading-snug text-ink-900">
                To make local trade simple, safe and fair, by pairing an easy mobile marketplace
                with real verification, inspection and support.
              </p>
            </div>
          </FadeIn>
        </Container>

        <Container className="mt-16">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Our objectives</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              What we&apos;re working towards
            </h2>
          </FadeIn>
          <StaggerGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {objectives.map((objective, i) => (
              <StaggerItem key={objective}>
                <div className="flex h-full gap-4 rounded-2xl bg-surface p-6">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gold-400 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-ink-700">{objective}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <FadeIn className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Why Ogasela</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              What you get that you won&apos;t get elsewhere
            </h2>
          </FadeIn>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <ValueCard icon={Store} title="For sellers" points={valueForSellers} />
            <ValueCard icon={ShoppingBag} title="For buyers" points={valueForBuyers} delay={0.1} />
          </div>
        </Container>
      </section>

      <section className="bg-white py-20">
        <Container>
          <FadeIn className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">How we operate</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              Open about how it all works
            </h2>
          </FadeIn>
          <StaggerGroup className="mt-12 grid gap-6 sm:grid-cols-2">
            {operations.map((item) => (
              <StaggerItem key={item.title}>
                <div className="flex h-full gap-4 rounded-2xl bg-surface p-6">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-ink-900">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{item.description}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
          <p className="mt-10 text-center text-sm text-ink-500">
            <Link href="/how-it-works" className="font-semibold text-brand-700 hover:underline">
              See how it works, step by step
            </Link>{" "}
            ·{" "}
            <Link href="/trust-and-safety" className="font-semibold text-brand-700 hover:underline">
              How we keep you safe
            </Link>
          </p>
        </Container>
      </section>

      <section className="py-20">
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
                <div className="flex gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink-900/5">
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

function ValueCard({
  icon: Icon,
  title,
  points,
  delay,
}: {
  icon: typeof Target;
  title: string;
  points: string[];
  delay?: number;
}) {
  return (
    <FadeIn delay={delay}>
      <div className="h-full rounded-3xl bg-white p-8 shadow-sm ring-1 ring-ink-900/5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Icon size={20} />
          </div>
          <h3 className="text-xl font-bold text-ink-900">{title}</h3>
        </div>
        <ul className="mt-6 space-y-3">
          {points.map((point) => (
            <li key={point} className="flex gap-3 text-sm text-ink-500">
              <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-brand-600" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </FadeIn>
  );
}
