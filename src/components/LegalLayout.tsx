import { ReactNode } from "react";
import { Container } from "./Container";
import { PageHeader } from "./PageHeader";
import { FadeIn } from "./FadeIn";

export function LegalLayout({
  eyebrow,
  title,
  lastUpdated,
  children,
}: {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={`Last updated: ${lastUpdated}`} />
      <section className="py-16">
        <Container className="max-w-3xl">
          <FadeIn>
            <article className="prose prose-ink max-w-none prose-headings:font-bold prose-headings:text-ink-900 prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-ink-900">
              {children}
            </article>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}
