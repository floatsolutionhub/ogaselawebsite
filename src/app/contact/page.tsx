import type { Metadata } from "next";
import { Clock, Mail, MapPin } from "lucide-react";
import { Container } from "@/components/site/Container";
import { PageHeader } from "@/components/site/PageHeader";
import { FadeIn } from "@/components/site/FadeIn";
import { ContactForm } from "@/components/site/ContactForm";
import { site } from "@/lib/marketing/site";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Get in touch with the Ogasela team. We're happy to help.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact us"
        title="We'd love to hear from you"
        description="Questions, feedback, or partnership ideas? Send us a message and our team will respond as soon as possible."
      />

      <section className="py-20">
        <Container className="grid gap-12 lg:grid-cols-5 [&>*]:min-w-0">
          <FadeIn className="lg:col-span-2">
            <div className="space-y-6">
              <InfoCard
                icon={<Mail size={20} />}
                title="Email us"
                lines={[site.supportEmail]}
              />
              <InfoCard icon={<MapPin size={20} />} title="Find us" lines={[site.location]} />
              <InfoCard
                icon={<Clock size={20} />}
                title="Response time"
                lines={["We typically reply within 1 to 2 business days."]}
              />
            </div>
          </FadeIn>

          <FadeIn delay={0.1} className="lg:col-span-3">
            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-ink-900/5">
              <ContactForm />
            </div>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}

function InfoCard({
  icon,
  title,
  lines,
}: {
  icon: React.ReactNode;
  title: string;
  lines: string[];
}) {
  return (
    <div className="flex gap-4 rounded-2xl bg-surface p-6">
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
        {icon}
      </div>
      <div className="min-w-0 break-words">
        <h3 className="font-bold text-ink-900">{title}</h3>
        {lines.map((line) => (
          <p key={line} className="mt-1 text-sm text-ink-500">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
