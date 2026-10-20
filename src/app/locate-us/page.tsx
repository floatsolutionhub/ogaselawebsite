import type { Metadata } from "next";
import { Clock, Mail, MapPin, Navigation } from "lucide-react";
import { Container } from "@/components/site/Container";
import { PageHeader } from "@/components/site/PageHeader";
import { FadeIn } from "@/components/site/FadeIn";
import { MapEmbed } from "@/components/site/MapEmbed";
import { site } from "@/lib/marketing/site";

export const metadata: Metadata = {
  title: "Locate us",
  description: "Find Ogasela's office in Lagos, Nigeria.",
};

export default function LocateUsPage() {
  const mapQuery = encodeURIComponent("Lagos, Nigeria");

  return (
    <>
      <PageHeader
        eyebrow="Locate us"
        title="Come say hello"
        description="We're based in Lagos, and building for every state in Nigeria."
      />

      <section className="py-20">
        <Container className="grid gap-10 lg:grid-cols-5">
          <FadeIn className="overflow-hidden rounded-3xl ring-1 ring-ink-900/5 lg:col-span-3">
            <MapEmbed query="Lagos, Nigeria" title="Ogasela office location" />
          </FadeIn>

          <FadeIn delay={0.1} className="lg:col-span-2">
            <div className="h-full space-y-6 rounded-3xl bg-surface p-8">
              <div className="flex gap-4">
                <IconBadge>
                  <MapPin size={18} />
                </IconBadge>
                <div>
                  <h3 className="font-bold text-ink-900">Our office</h3>
                  <p className="mt-1 text-sm text-ink-500">{site.location}</p>
                  <p className="mt-1 text-xs text-ink-300">
                    Exact address available on request. Office Pickup branch addresses are shown
                    in the app when you choose a branch.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <IconBadge>
                  <Clock size={18} />
                </IconBadge>
                <div>
                  <h3 className="font-bold text-ink-900">Office hours</h3>
                  <p className="mt-1 text-sm text-ink-500">Monday to Friday, 9am to 5pm WAT</p>
                </div>
              </div>

              <div className="flex gap-4">
                <IconBadge>
                  <Mail size={18} />
                </IconBadge>
                <div>
                  <h3 className="font-bold text-ink-900">Prefer email?</h3>
                  <a
                    href={`mailto:${site.supportEmail}`}
                    className="mt-1 block text-sm text-brand-700 hover:underline"
                  >
                    {site.supportEmail}
                  </a>
                </div>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition-colors hover:bg-brand-700"
              >
                <Navigation size={16} />
                Get directions
              </a>
            </div>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}

function IconBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
      {children}
    </div>
  );
}
