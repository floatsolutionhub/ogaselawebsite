import Link from "next/link";
import { Container } from "@/components/Container";

export default function NotFound() {
  return (
    <section className="bg-gradient-to-b from-brand-50 to-surface py-28">
      <Container className="max-w-xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">404</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink-900">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-4 text-ink-500">It may have moved, or the link may be wrong.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Go home
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-brand-200 bg-white px-6 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50"
          >
            Contact us
          </Link>
        </div>
      </Container>
    </section>
  );
}
