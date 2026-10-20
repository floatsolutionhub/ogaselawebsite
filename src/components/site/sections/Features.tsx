import { BadgeCheck, Bell, MapPinned, PackageCheck, ShieldCheck, Sparkles, Star, Tags } from "lucide-react";
import { Container } from "../Container";
import { FadeIn, StaggerGroup, StaggerItem } from "../FadeIn";

const features = [
  {
    icon: ShieldCheck,
    title: "Verified sellers",
    description: "Sellers prove who they are with ID, a face check and proof of address. Look for the badge before you buy.",
  },
  {
    icon: Tags,
    title: "Every category",
    description: "Phones, fashion, property, vehicles, home & furniture, jobs, services and more, all in one app.",
  },
  {
    icon: MapPinned,
    title: "Hyperlocal search",
    description: "Browse by state and city across all 36 states and the FCT, so you're always shopping near home.",
  },
  {
    icon: Star,
    title: "Reviews you can trust",
    description: "Buyers rate sellers after dealing with them, so a good track record is visible to everyone who comes next.",
  },
  {
    icon: Bell,
    title: "Real-time chat",
    description: "Message sellers instantly, get notified the moment they reply, and see safety tips right in the chat.",
  },
  {
    icon: BadgeCheck,
    title: "Ad plans that get you seen",
    description: "Paid plans give your ad a longer run, more photos and video, a boost in search, and promotion on TikTok and Facebook.",
  },
  {
    icon: PackageCheck,
    title: "Office Pickup",
    description: "On eligible items, pay Ogasela instead of a stranger. We inspect the item against its ad before you collect it.",
  },
  {
    icon: Sparkles,
    title: "AI listing helper",
    description: "Get a description written for you, a suggested price from similar ads, and cleaner photos in seconds.",
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

        <StaggerGroup className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
