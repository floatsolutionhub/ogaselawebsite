import { ReactNode } from "react";
import { Container } from "./Container";
import { AnimatedText } from "./AnimatedText";
import { FadeIn } from "./FadeIn";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-surface py-20">
      <div className="bg-noise absolute inset-0 opacity-40" />
      <Container className="relative text-center">
        <FadeIn>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            {eyebrow}
          </p>
          <h1 className="mx-auto mt-3 max-w-2xl text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl">
            <AnimatedText text={title} />
          </h1>
          {description && (
            <p className="mx-auto mt-5 max-w-xl text-lg text-ink-500">{description}</p>
          )}
          {children}
        </FadeIn>
      </Container>
    </section>
  );
}
