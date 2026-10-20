import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  BadgeCheck,
  Eye,
  Flag,
  Lock,
  MessageSquareWarning,
  PackageCheck,
  Scale,
  ScanFace,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Container } from "@/components/site/Container";
import { PageHeader } from "@/components/site/PageHeader";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/site/FadeIn";
import { site } from "@/lib/marketing/site";

export const metadata: Metadata = {
  title: "Trust & safety",
  description:
    "How Ogasela keeps buyers and sellers safe: seller verification, ad review, fraud checks, reporting, disputes and Office Pickup.",
};

const protections = [
  {
    icon: ScanFace,
    title: "Seller verification",
    description:
      "Sellers submit a government-issued ID, pass a live face check that proves a real person is behind the account, and provide proof of address. Our team reviews every submission before the verified badge appears.",
  },
  {
    icon: Eye,
    title: "Ad review",
    description:
      "New ads can be held for review by our moderation team before they go live, and any ad can be taken down if it breaks our rules.",
  },
  {
    icon: AlertTriangle,
    title: "Fraud checks",
    description:
      "We automatically flag warning signs, such as prices far below similar ads, requests to pay outside the platform, or brand-new accounts, so our team can take a closer look.",
  },
  {
    icon: MessageSquareWarning,
    title: "Safer chat",
    description:
      "Chats stay inside the app, with safety reminders shown above every conversation. Buyers can message sellers without sharing their own number.",
  },
  {
    icon: Flag,
    title: "Report anything",
    description:
      "Report a suspicious ad or user in a couple of taps. Our team investigates and can remove ads, suspend accounts or revoke verification.",
  },
  {
    icon: Scale,
    title: "Disputes",
    description:
      "If a deal goes wrong, open a dispute in the app. You can send messages and evidence, and our team works it through to a resolution.",
  },
  {
    icon: Star,
    title: "Honest reviews",
    description: "Buyers rate sellers after dealing with them, so a track record is visible to everyone who comes next.",
  },
  {
    icon: PackageCheck,
    title: "Office Pickup",
    description:
      "On eligible items, pay Ogasela instead of a stranger. We inspect the item against its ad before you collect it, and refund you if it fails.",
  },
  {
    icon: Lock,
    title: "Your data, protected",
    description:
      "We follow the Nigeria Data Protection Act. Face-check photos are deleted after 30 days, passwords are never stored in plain text, and we never sell your data.",
  },
];

const tips = [
  "Never pay a deposit or send money before you've seen the item, unless you're using Office Pickup.",
  "Meet in a busy public place during the day, and bring someone with you for high-value items.",
  "Inspect the item properly: switch it on, check serial numbers, and compare it to the photos.",
  "Keep your conversation in the Ogasela chat. Be wary of anyone who pushes you to WhatsApp or asks for codes.",
  "Ogasela staff will never ask for your password, OTP or card PIN.",
  "If a deal looks too good to be true, it probably is. Report it.",
];

export default function TrustAndSafetyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Trust & safety"
        title="Trade with people you can trust"
        description="Online marketplaces only work when people feel safe. Here's what we do to protect you, and what you can do too."
      />

      <section className="py-20">
        <Container>
          <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {protections.map((item) => (
              <StaggerItem key={item.title}>
                <div className="h-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink-900/5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <item.icon size={20} />
                  </div>
                  <h2 className="mt-4 font-bold text-ink-900">{item.title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{item.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>

      <section className="bg-white py-20">
        <Container className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Stay safe</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900">
              Six habits that stop most scams
            </h2>
            <ul className="mt-6 space-y-3">
              {tips.map((tip) => (
                <li key={tip} className="flex gap-3 text-ink-500">
                  <ShieldCheck size={18} className="mt-0.5 flex-shrink-0 text-brand-600" />
                  {tip}
                </li>
              ))}
            </ul>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="rounded-3xl bg-brand-900 p-8 text-white sm:p-10">
              <BadgeCheck size={28} className="text-gold-300" />
              <h2 className="mt-4 text-2xl font-bold">Something not right?</h2>
              <p className="mt-3 text-brand-100">
                Use <strong className="text-white">Report</strong> on the ad or profile in the app,
                or open a dispute from your deal. For anything urgent, or if you&apos;ve been
                defrauded, email us with the ad link and what happened, and report it to the
                police.
              </p>
              <a
                href={`mailto:${site.supportEmail}?subject=${encodeURIComponent("Safety report")}`}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-700"
              >
                Email {site.supportEmail}
              </a>
              <p className="mt-6 text-xs text-brand-200">
                Read the rules every user agrees to in our{" "}
                <Link href="/terms-and-conditions" className="font-semibold text-white hover:underline">
                  Terms &amp; Conditions
                </Link>{" "}
                and how we handle your data in our{" "}
                <Link href="/privacy-policy" className="font-semibold text-white hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}
