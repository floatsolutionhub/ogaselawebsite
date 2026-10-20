import Link from "next/link";
import { Camera, Handshake, MessageCircle } from "lucide-react";
import { Container } from "../Container";
import { FadeIn, StaggerGroup, StaggerItem } from "../FadeIn";

const steps = [
  {
    icon: Camera,
    title: "Post your ad",
    description:
      "Snap a few photos, pick a category and set your price. Start on the Free plan, or choose a paid plan for more photos, a longer run and a boost in search. Our AI helper can even write the description.",
  },
  {
    icon: MessageCircle,
    title: "Chat with buyers",
    description:
      "Buyers near you message or call you from your ad. Answer questions, share more photos and agree a price, with every chat kept on record in the app.",
  },
  {
    icon: Handshake,
    title: "Close the deal safely",
    description:
      "Meet in a safe public place, or use Office Pickup on eligible items: the buyer pays Ogasela, you drop the item at our branch, and we inspect it before handing it over.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-24">
      <Container>
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Selling on Ogasela takes three steps
          </h2>
          <p className="mt-4 text-lg text-ink-500">
            No confusing fees and no commission on your deals. Just a straightforward way to
            turn what you have into what you need.
          </p>
        </FadeIn>

        <StaggerGroup className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <StaggerItem key={step.title}>
              <div className="relative h-full rounded-3xl border border-ink-900/5 bg-surface p-8">
                <span className="absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-full bg-gold-400 text-sm font-bold text-white shadow-md">
                  {i + 1}
                </span>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                  <step.icon size={22} />
                </div>
                <h3 className="mt-5 text-lg font-bold text-ink-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{step.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <p className="mt-10 text-center text-sm text-ink-500">
          Buying instead?{" "}
          <Link href="/how-it-works" className="font-semibold text-brand-700 hover:underline">
            See how Ogasela works for buyers and sellers
          </Link>
        </p>
      </Container>
    </section>
  );
}
