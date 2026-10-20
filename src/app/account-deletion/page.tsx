import type { Metadata } from "next";
import { Container } from "@/components/site/Container";
import { PageHeader } from "@/components/site/PageHeader";
import { FadeIn } from "@/components/site/FadeIn";
import { DeletionRequestForm } from "@/components/site/DeletionRequestForm";

export const metadata: Metadata = {
  title: "Account / Data Deletion",
  description: "Request deletion of your Ogasela account or specific personal data.",
};

export default function AccountDeletionPage() {
  return (
    <>
      <PageHeader
        eyebrow="Account & data"
        title="Account / Data deletion"
        description="You're always in control of your data. Choose the option below that fits what you need."
      />

      <section className="py-16">
        <Container className="max-w-3xl">
          <FadeIn className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-ink-900/10 bg-white p-6">
              <h2 className="font-bold text-ink-900">Delete my account and associated data</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                Permanently closes your Ogasela account and removes your profile, listings, and
                associated personal data from active use, subject to the retention exceptions
                below.
              </p>
            </div>
            <div className="rounded-2xl border border-ink-900/10 bg-white p-6">
              <h2 className="font-bold text-ink-900">
                Delete some of my data without deleting my account
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                Keeps your account active while we delete specific personal data you tell us
                about, for example a listing, a review, or your chat history.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1} className="mt-12">
            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-ink-900/5 sm:p-10">
              <h2 className="text-xl font-bold text-ink-900">Request form</h2>
              <p className="mt-1 text-sm text-ink-500">
                Fill in the form below and our team will process your request.
              </p>
              <div className="mt-8">
                <DeletionRequestForm />
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}
