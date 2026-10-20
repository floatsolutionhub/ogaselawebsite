"use client";

import { Container } from "../Container";
import { FadeIn } from "../FadeIn";
import { StoreBadges } from "../StoreBadges";
import { GetAppButton } from "../GetAppButton";
import { useLaunch } from "../LaunchProvider";

export function CtaBanner() {
  const { appLive } = useLaunch();

  return (
    <section id="download" className="relative scroll-mt-20 overflow-hidden bg-brand-700 py-24">
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gold-500/20 blur-3xl" />

      <Container className="relative text-center">
        <FadeIn>
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {appLive
              ? "Your next buyer is already nearby. Download Ogasela today."
              : "Be first in line when Ogasela launches."}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-100">
            {appLive
              ? "Free to download on iOS and Android. Post your first ad in minutes."
              : "We're putting the finishing touches on the app for iOS and Android. Join the waiting list and we'll email you the day it's live."}
          </p>

          {!appLive && <GetAppButton variant="secondary" className="mt-8 px-8 py-4 text-base" />}
          <StoreBadges variant="dark" className="mt-8 justify-center" />
        </FadeIn>
      </Container>
    </section>
  );
}
