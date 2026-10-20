import { Quote } from "lucide-react";

import { Container } from "@/components/Container";
import { SectionHeading, Stars } from "@/components/market/Badges";
import { settle } from "@/lib/api/client";
import { getTestimonials } from "@/lib/api/services/misc";

/**
 * Voices from the market square - the published testimonials staff manage on the Control Portal's
 * Testimonials page. Hidden while there are none, or if the API can't be reached.
 */
export async function Testimonials() {
  const items = (await settle(getTestimonials())) ?? [];
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="testimonials-title" className="woven py-20">
      <Container>
        <div id="testimonials-title">
          <SectionHeading eyebrow="Word on the street" title="Traders love doing business here" />
        </div>
        <ul className="grid gap-5 md:grid-cols-3">
          {items.map((item) => (
            <li key={item.id}>
              <figure className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white p-7 shadow-card ring-1 ring-canvas-dark/60">
                <span aria-hidden className="awning-sm absolute inset-x-0 top-0 h-3" />
                <Quote aria-hidden className="mt-2 size-8 text-gold-400" />
                <blockquote className="mt-3 flex-1 text-[15px] leading-7 text-ink-700">“{item.quote}”</blockquote>
                <Stars rating={item.rating} className="mt-5" />
                <figcaption className="mt-4 flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-full bg-brand-600 font-bold text-gold-300">
                    {item.name.charAt(0).toUpperCase()}
                  </span>
                  <span>
                    <span className="block font-semibold text-ink-900">{item.name}</span>
                    <span className="text-sm text-ink-500">{item.role}</span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
