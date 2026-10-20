import type { Metadata } from "next";
import { Coffee, Rocket, Sprout, Users } from "lucide-react";
import { Container } from "@/components/site/Container";
import { PageHeader } from "@/components/site/PageHeader";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/site/FadeIn";
import { site } from "@/lib/marketing/site";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join the team building Nigeria's marketplace for anything, from anyone, nearby.",
};

const perks = [
  {
    icon: Rocket,
    title: "Real impact",
    description: "Ship features that Nigerian buyers and sellers across the country will rely on every day.",
  },
  {
    icon: Sprout,
    title: "Room to grow",
    description: "We're early, so you'll help shape the product, not just execute a spec.",
  },
  {
    icon: Users,
    title: "Small, sharp team",
    description: "Work closely with people who care deeply about the craft and the mission.",
  },
  {
    icon: Coffee,
    title: "Flexible by default",
    description: "We care about outcomes, not hours logged at a desk.",
  },
];

export default function CareersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Careers"
        title="Help us build Nigeria's marketplace"
        description="We're a small team solving a big problem. If that excites you, we'd love to hear from you."
      />

      <section className="py-20">
        <Container>
          <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {perks.map((perk) => (
              <StaggerItem key={perk.title}>
                <div className="h-full rounded-2xl bg-surface p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                    <perk.icon size={20} />
                  </div>
                  <h3 className="mt-4 font-bold text-ink-900">{perk.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
                    {perk.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Container>
      </section>

      <section className="bg-white py-20">
        <Container className="max-w-2xl text-center">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              Open roles
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              No open roles right now
            </h2>
            <p className="mt-4 text-ink-500">
              We don&apos;t have any positions listed at the moment, but we&apos;re always happy
              to hear from people who believe in what we&apos;re building. Send your CV and a
              short note about why you&apos;d be a great fit, and we&apos;ll reach out when a
              matching role opens up.
            </p>
            <a
              href={`mailto:${site.supportEmail}?subject=${encodeURIComponent("General application: Careers")}`}
              className="mt-8 inline-flex items-center justify-center rounded-full bg-brand-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition-colors hover:bg-brand-700"
            >
              Send a general application
            </a>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}
