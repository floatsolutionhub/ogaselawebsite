import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  Camera,
  ClipboardCheck,
  CreditCard,
  Handshake,
  MapPin,
  Megaphone,
  MessageCircle,
  PackageCheck,
  Search,
  Sparkles,
  Star,
  Store,
  UserCheck,
} from "lucide-react";
import { Container } from "@/components/site/Container";
import { PageHeader } from "@/components/site/PageHeader";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/site/FadeIn";
import { CtaBanner } from "@/components/site/sections/CtaBanner";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How buying and selling on Ogasela works: verified sellers, ad plans, in-app chat, AI listing tools and Office Pickup with inspection.",
};

const sellerSteps = [
  {
    icon: UserCheck,
    title: "Create your account and get verified",
    description:
      "Sign up with your phone or email. To post ads, verify your identity once: a government ID, a quick live face check, and proof of address. Our team reviews them, and verified sellers get a badge buyers can see.",
  },
  {
    icon: Camera,
    title: "Post your ad",
    description:
      "Add photos, a title, a price and your location. Not sure what to write? The AI helper drafts a description, suggests a price from similar ads, and tidies up your photos.",
  },
  {
    icon: Megaphone,
    title: "Choose how far it reaches",
    description:
      "Start free, or pick a paid plan for a longer run, more photos and video, a higher place in search, and promotion on TikTok and Facebook. Pay securely by card, bank transfer or USSD through Paystack.",
  },
  {
    icon: MessageCircle,
    title: "Chat, agree, sell",
    description:
      "Buyers message you in the app. Agree a price and how to hand over, meet in a safe public place or use Office Pickup. Then build your reputation with reviews from happy buyers.",
  },
];

const buyerSteps = [
  {
    icon: MapPin,
    title: "Browse near you",
    description: "Pick your state and city and see what's for sale around you, or search across every category.",
  },
  {
    icon: Search,
    title: "Check the seller",
    description:
      "Look for the verified badge, read the seller's reviews and check when they joined before you commit.",
  },
  {
    icon: MessageCircle,
    title: "Ask in the chat",
    description:
      "Ask questions, request more photos and agree a price in the app. Your chat history stays on record if something goes wrong.",
  },
  {
    icon: Handshake,
    title: "Buy your way",
    description:
      "Inspect the item in person in a safe public place before paying, or choose Office Pickup on eligible items and let us check it for you.",
  },
];

const pickupSteps = [
  { icon: CreditCard, title: "You pay Ogasela", description: "The item price plus a 3% service fee, through Paystack. You get an emailed receipt." },
  { icon: Store, title: "Seller drops it off", description: "We tell the seller to bring the item to the Ogasela branch you chose." },
  { icon: ClipboardCheck, title: "We inspect it", description: "Our staff check the item matches its ad, and tell you the result in the app." },
  { icon: PackageCheck, title: "You collect it", description: "Quote your pickup reference at the branch, or have it delivered where available." },
];

const plans = [
  { name: "Free", points: ["Live for 7 days", "Up to 5 photos", "Basic AI listing helper"] },
  { name: "Basic", points: ["Live for 15 days", "Up to 8 photos", "Small boost in search", "Promote on TikTok and Facebook"] },
  { name: "Standard", points: ["Live for 21 days", "Up to 10 photos and a video", "Stronger boost in search", "Full AI listing tools"] },
  { name: "Premium", points: ["Live for 30 days", "Up to 12 photos and a video", "Top boost in search", "Ad credit included"] },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader
        eyebrow="How it works"
        title="Buying and selling, the Ogasela way"
        description="One app to find what you need near you, sell what you don't, and do it with people you can trust."
      />

      <StepsSection
        id="selling"
        eyebrow="For sellers"
        title="Turn what you have into money"
        steps={sellerSteps}
        background="bg-white"
      />

      <StepsSection
        id="buying"
        eyebrow="For buyers"
        title="Find it nearby, buy it with confidence"
        steps={buyerSteps}
        background="bg-surface"
      />

      <section id="office-pickup" className="scroll-mt-20 bg-brand-900 py-20 text-white">
        <Container>
          <FadeIn className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-gold-300">Office Pickup</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Don&apos;t pay a stranger. Pay Ogasela, and we check it first.
            </h2>
            <p className="mt-4 text-brand-100">
              Available on ads in selected categories. You pay Ogasela, not the seller, and we
              keep you updated in the app at every step until the item is in your hands.
            </p>
          </FadeIn>

          <StaggerGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pickupSteps.map((step, i) => (
              <StaggerItem key={step.title}>
                <div className="h-full rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-400 text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <step.icon size={20} className="text-brand-200" />
                  </div>
                  <h3 className="mt-4 font-bold">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-brand-100">{step.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-brand-200">
            If the item fails inspection, or you cancel before collecting it, we refund what you
            paid less a 1% processing fee. Full details are in our{" "}
            <Link href="/terms-and-conditions#office-pickup" className="font-semibold text-white hover:underline">
              Terms &amp; Conditions
            </Link>
            .
          </p>
        </Container>
      </section>

      <section id="plans" className="scroll-mt-20 bg-white py-20">
        <Container>
          <FadeIn className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Ad plans</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              Start free. Pay only for more reach.
            </h2>
            <p className="mt-4 text-ink-500">
              Every plan puts your ad in front of buyers near you. Paid plans keep it up longer
              and push it higher. Prices are shown in the app before you pay, and there&apos;s
              never a commission on what you sell.
            </p>
          </FadeIn>

          <StaggerGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan, i) => (
              <StaggerItem key={plan.name}>
                <div
                  className={`h-full rounded-3xl p-6 ${
                    i === 3 ? "bg-brand-600 text-white" : "bg-surface ring-1 ring-ink-900/5"
                  }`}
                >
                  <h3 className={`text-lg font-bold ${i === 3 ? "text-white" : "text-ink-900"}`}>{plan.name}</h3>
                  <ul className={`mt-4 space-y-2 text-sm ${i === 3 ? "text-brand-50" : "text-ink-500"}`}>
                    {plan.points.map((point) => (
                      <li key={point} className="flex gap-2">
                        <BadgeCheck size={16} className={`mt-0.5 flex-shrink-0 ${i === 3 ? "text-gold-300" : "text-brand-600"}`} />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <FadeIn>
              <div className="flex h-full gap-4 rounded-2xl bg-surface p-6">
                <Sparkles size={22} className="mt-1 flex-shrink-0 text-gold-500" />
                <div>
                  <h3 className="font-bold text-ink-900">AI listing tools</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
                    Write a clear description from a few details, get a fair price suggestion
                    based on similar ads, and enhance your photos. You stay in control: review
                    and edit anything before it goes live.
                  </p>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="flex h-full gap-4 rounded-2xl bg-surface p-6">
                <Star size={22} className="mt-1 flex-shrink-0 text-gold-500" />
                <div>
                  <h3 className="font-bold text-ink-900">Reviews and insights</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
                    Buyers can review sellers after a deal, so good service gets noticed. Sellers
                    see how many people viewed, saved and messaged about each ad.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>

          <p className="mt-10 text-center text-sm text-ink-500">
            Want to know how we keep the marketplace safe?{" "}
            <Link href="/trust-and-safety" className="font-semibold text-brand-700 hover:underline">
              Read about trust &amp; safety
            </Link>
          </p>
        </Container>
      </section>

      <CtaBanner />
    </>
  );
}

function StepsSection({
  id,
  eyebrow,
  title,
  steps,
  background,
}: {
  id: string;
  eyebrow: string;
  title: string;
  steps: { icon: typeof Camera; title: string; description: string }[];
  background: string;
}) {
  return (
    <section id={id} className={`scroll-mt-20 py-20 ${background}`}>
      <Container>
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">{title}</h2>
        </FadeIn>

        <StaggerGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <StaggerItem key={step.title}>
              <div className="relative h-full rounded-3xl border border-ink-900/5 bg-white p-6 shadow-sm">
                <span className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-gold-400 text-sm font-bold text-white shadow-md">
                  {i + 1}
                </span>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                  <step.icon size={20} />
                </div>
                <h3 className="mt-4 font-bold text-ink-900">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{step.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
