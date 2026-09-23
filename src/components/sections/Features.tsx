import { BadgeCheck, Bell, MapPinned, ShieldCheck, Tags, Wallet2 } from "lucide-react";
import { Container } from "../Container";
import { FadeIn, StaggerGroup, StaggerItem } from "../FadeIn";

const features = [
  {
    icon: ShieldCheck,
    title: "KYC-verified sellers",
    description: "Look for the verified badge on trusted sellers before you buy.",
  },
  {
    icon: Tags,
    title: "Every category",
    description: "Electronics, fashion, real estate, jobs, vehicles, and more — all in one app.",
  },
  {
    icon: MapPinned,
    title: "Hyperlocal search",
    description: "Find listings by state and city, so you're always shopping near home.",
  },
  {
    icon: Wallet2,
    title: "In-app wallet",
    description: "Fund your wallet, get paid, and track your balance without leaving the app.",
  },
  {
    icon: Bell,
    title: "Real-time chat",
    description: "Message sellers instantly and get notified the moment they reply.",
  },
  {
    icon: BadgeCheck,
    title: "Boosted listings",
    description: "Promote your ad to reach more buyers, faster, when it matters most.",
  },
];

export function Features() {
  return (
    <section className="bg-surface py-24">
      <Container>
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            Why Ogasela
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Built for how Nigerians actually buy and sell
          </h2>
        </FadeIn>

        <StaggerGroup className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <div className="group h-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink-900/5 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-900/5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <feature.icon size={20} />
                </div>
                <h3 className="mt-4 font-bold text-ink-900">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
                  {feature.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
