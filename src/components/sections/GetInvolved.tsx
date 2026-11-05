"use client";

import { useState } from "react";
import { Heart, Rocket } from "lucide-react";
import { Container } from "../Container";
import { FadeIn } from "../FadeIn";
import { Modal } from "../Modal";
import { DonateOptions } from "../DonateOptions";
import { useLaunch } from "../LaunchProvider";

export function GetInvolved() {
  const { openInterestForm } = useLaunch();
  const [donateOpen, setDonateOpen] = useState(false);

  return (
    <section id="get-involved" className="scroll-mt-20 bg-surface py-24">
      <Container>
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            Get involved
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Be part of the story from day one
          </h2>
        </FadeIn>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <FadeIn>
            <div className="flex h-full flex-col rounded-3xl bg-brand-700 p-8 text-white sm:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <Rocket size={22} />
              </div>
              <h3 className="mt-6 text-2xl font-bold">Join our testers</h3>
              <p className="mt-3 flex-1 text-brand-100">
                Try pre-release builds of the app on your own phone, tell us what works and what
                doesn&apos;t, and help shape a marketplace built for how Nigerians really trade,
                before anyone else gets their hands on it.
              </p>
              <button
                type="button"
                onClick={() => openInterestForm("tester")}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-brand-700 shadow-lg transition-transform hover:-translate-y-0.5"
              >
                <Rocket size={16} /> Join Our Testers
              </button>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="flex h-full flex-col rounded-3xl bg-white p-8 shadow-sm ring-1 ring-ink-900/5 sm:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-100 text-gold-600">
                <Heart size={22} />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-ink-900">Support our journey</h3>
              <p className="mt-3 flex-1 text-ink-500">
                Building Nigeria&apos;s marketplace from scratch takes grit and a little
                help. Every contribution fuels the servers, the hustle, and the dream of a fairer
                marketplace for every trader, from Alaba to Aba.
              </p>
              <button
                type="button"
                onClick={() => setDonateOpen(true)}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-gold-400 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-gold-500/20 transition-transform hover:-translate-y-0.5"
              >
                <Heart size={16} /> Support Our Journey
              </button>
            </div>
          </FadeIn>
        </div>
      </Container>

      <Modal open={donateOpen} onClose={() => setDonateOpen(false)} title="Support our journey">
        <DonateOptions />
      </Modal>
    </section>
  );
}
