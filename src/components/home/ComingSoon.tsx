import Link from "next/link";
import { Clapperboard, Gavel, Megaphone, Sparkles, Store, UserRoundCheck } from "lucide-react";

import { Container } from "@/components/Container";
import { buttonClass } from "@/components/ui/styles";

const SELLER_POINTS = [
  { icon: Megaphone, text: "When you post an ad, choose to hire an influencer to market it for you." },
  { icon: Clapperboard, text: "They create content for your item, like videos and photo stories, made for their audience." },
  { icon: Store, text: "Add the finished content to your ad page so every buyer sees it." },
];

const INFLUENCER_POINTS = [
  { icon: UserRoundCheck, text: "Register as an Ogasela influencer and set up your profile." },
  { icon: Sparkles, text: "Scroll through freshly posted ads and find products your followers will love." },
  { icon: Gavel, text: "Send the seller a bid to promote their ad, and get hired for the job." },
];

/** What's on the way. First up: the Ogasela Influencer Program. */
export function ComingSoon() {
  return (
    <section aria-labelledby="coming-soon-title" className="py-20">
      <Container>
        <div className="ankara relative overflow-hidden rounded-[2rem] text-white">
          <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-900/95 to-brand-800/80" />
          <div aria-hidden className="awning absolute inset-x-0 top-0 h-5" />
          <div className="relative px-6 pb-12 pt-14 sm:px-12">
            <p className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-brand-900">
              <Sparkles aria-hidden className="size-3.5" /> Coming soon
            </p>
            <h2 id="coming-soon-title" className="mt-5 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              The Ogasela <span className="text-gold-400">Influencer Program</span>
            </h2>
            <p className="mt-4 max-w-2xl text-brand-100 sm:text-lg">
              Great items deserve a crowd. Soon, sellers will be able to hire creators to market their ads, and creators will be able to earn by
              promoting the items they believe in.
            </p>

            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              <Column title="For sellers" subtitle="Get your ad in front of more buyers" points={SELLER_POINTS} />
              <Column title="For influencers" subtitle="Turn your following into income" points={INFLUENCER_POINTS} />
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/contact" className={buttonClass("gold", "lg")}>
                I&apos;m interested
              </Link>
              <p className="text-sm text-brand-200">Tell us you&apos;d like to join and we&apos;ll reach out when it launches.</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Column({
  title,
  subtitle,
  points,
}: {
  title: string;
  subtitle: string;
  points: { icon: typeof Megaphone; text: string }[];
}) {
  return (
    <div className="rounded-3xl bg-white/[0.07] p-6 ring-1 ring-white/15 backdrop-blur-sm">
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-sm text-gold-300">{subtitle}</p>
      <ol className="mt-5 space-y-4">
        {points.map(({ icon: Icon, text }, index) => (
          <li key={text} className="flex gap-4">
            <span className="relative grid size-11 shrink-0 place-items-center rounded-2xl bg-gold-400 text-brand-900">
              <Icon aria-hidden className="size-5" />
              <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-white text-[11px] font-bold text-brand-800">
                {index + 1}
              </span>
            </span>
            <p className="pt-2 text-[15px] leading-6 text-brand-50">{text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
