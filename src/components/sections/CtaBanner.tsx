import { Container } from "../Container";
import { FadeIn } from "../FadeIn";
import { StoreBadges } from "../StoreBadges";

export function CtaBanner() {
  return (
    <section id="download" className="relative overflow-hidden bg-brand-700 py-24">
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gold-500/20 blur-3xl" />

      <Container className="relative text-center">
        <FadeIn>
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your next buyer is already nearby. Download Ogasela today.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-100">
            Available soon on iOS and Android. Join the waitlist and be first to list.
          </p>

          <StoreBadges variant="dark" className="mt-10 justify-center" />
        </FadeIn>
      </Container>
    </section>
  );
}
