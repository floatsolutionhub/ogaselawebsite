"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Copy, Mail, ShieldCheck, Smartphone, ThumbsUp, X } from "lucide-react";
import { Container } from "@/components/site/Container";

export type PaymentOutcome = "success" | "cancelled" | "failed";

/** The app waits for this link (WebBrowser.openAuthSessionAsync) to close checkout and confirm the payment. */
const APP_RETURN_URL = "ogasela://payment-complete";
const AUTO_RETURN_SECONDS = 4;

const CONFETTI_COLORS = ["#228c4c", "#fac122", "#3fa669", "#f0b400", "#6cbe8b", "#146c36"];

const COPY: Record<PaymentOutcome, { title: string; body: string }> = {
  success: {
    title: "Payment successful",
    body: "Thank you! We've received your payment and your receipt is on its way to your email.",
  },
  cancelled: {
    title: "Payment cancelled",
    body: "You cancelled the payment, so nothing was charged. You can try again from the app whenever you're ready.",
  },
  failed: {
    title: "Payment didn't go through",
    body: "Your bank declined the payment and nothing was charged. Please try again from the app.",
  },
};

export function PaymentResult({ outcome, reference }: { outcome: PaymentOutcome; reference: string | null }) {
  const reduceMotion = useReducedMotion();
  const [secondsLeft, setSecondsLeft] = useState(AUTO_RETURN_SECONDS);
  const [copied, setCopied] = useState(false);

  const returnUrl = `${APP_RETURN_URL}?${new URLSearchParams({
    status: outcome,
    ...(reference ? { reference } : {}),
  }).toString()}`;

  // Hand the payer back to the app automatically; the button below covers browsers that block it.
  useEffect(() => {
    if (secondsLeft <= 0) {
      // A custom-scheme link into the app, not a Next.js page, so router navigation doesn't apply.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = returnUrl;
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, returnUrl]);

  const copyReference = async () => {
    if (!reference) return;
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be unavailable inside in-app browsers; the reference is still on screen.
    }
  };

  const success = outcome === "success";
  const { title, body } = COPY[outcome];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-surface to-surface py-16 sm:py-24">
      <Container className="max-w-xl">
        <div className="relative rounded-3xl bg-white px-6 py-10 text-center shadow-xl shadow-brand-900/5 ring-1 ring-ink-900/5 sm:px-10 sm:py-12">
          <div className="relative mx-auto flex h-36 w-36 items-center justify-center">
            {success && !reduceMotion && <Celebration />}
            {success ? <ThumbsUpBadge animate={!reduceMotion} /> : <StatusBadge outcome={outcome} animate={!reduceMotion} />}
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5, ease: "easeOut" }}
          >
            <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">{title}</h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-500 sm:text-base">{body}</p>

            {reference && (
              <button
                type="button"
                onClick={copyReference}
                className="mx-auto mt-6 flex max-w-full items-center gap-2 rounded-full bg-surface px-4 py-2 text-xs text-ink-700 ring-1 ring-ink-900/10 transition hover:ring-brand-300"
                aria-label="Copy payment reference"
              >
                <span className="text-ink-500">Reference</span>
                <span className="truncate font-mono font-semibold text-ink-900">{reference}</span>
                {copied ? <Check size={14} className="shrink-0 text-brand-600" /> : <Copy size={14} className="shrink-0" />}
              </button>
            )}
          </motion.div>

          {success && (
            <motion.ul
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="mt-8 space-y-3 text-left"
            >
              <NextStep icon={Mail} text="A receipt has been sent to the email on your account." />
              <NextStep icon={Smartphone} text="Head back to the app to see your updated order or ad." />
              <NextStep icon={ShieldCheck} text="Payments are processed securely by our licensed payment partner." />
            </motion.ul>
          )}

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.4 }}
            className="mt-8"
          >
            <a
              href={returnUrl}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700 active:bg-brand-800"
            >
              <Smartphone size={16} /> Return to the Ogasela app
            </a>
            <p className="mt-3 text-xs text-ink-300" aria-live="polite">
              {secondsLeft > 0
                ? `Taking you back to the app in ${secondsLeft}s…`
                : "Paid on a computer? You can safely close this tab."}
            </p>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

function ThumbsUpBadge({ animate }: { animate: boolean }) {
  return (
    <>
      {/* Soft pulse rings behind the badge. */}
      {animate &&
        [0, 0.6].map((delay) => (
          <motion.span
            key={delay}
            className="absolute inset-0 rounded-full bg-brand-200"
            initial={{ scale: 0.6, opacity: 0.6 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ delay: 0.5 + delay, duration: 1.8, repeat: Infinity, repeatDelay: 0.6, ease: "easeOut" }}
          />
        ))}
      <motion.div
        className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 shadow-xl shadow-brand-600/30"
        initial={animate ? { scale: 0, rotate: -30 } : false}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 14 }}
      >
        <motion.div
          initial={animate ? { y: 18, rotate: -25, opacity: 0 } : false}
          animate={animate ? { y: 0, rotate: [-25, 12, -6, 0], opacity: 1 } : { opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.9, ease: "easeOut" }}
          style={{ transformOrigin: "30% 90%" }}
        >
          <ThumbsUp size={52} strokeWidth={2.2} className="fill-gold-300 text-white" />
        </motion.div>
      </motion.div>
    </>
  );
}

function StatusBadge({ outcome, animate }: { outcome: PaymentOutcome; animate: boolean }) {
  return (
    <motion.div
      className={`flex h-28 w-28 items-center justify-center rounded-full ${
        outcome === "failed" ? "bg-danger/10 text-danger" : "bg-ink-900/5 text-ink-500"
      }`}
      initial={animate ? { scale: 0 } : false}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
    >
      <X size={48} strokeWidth={2.4} />
    </motion.div>
  );
}

/** A one-off burst of confetti from behind the thumbs up. Positions are fixed so the server and client render the same markup. */
function Celebration() {
  const pieces = Array.from({ length: 18 }, (_, i) => {
    const angle = (i / 18) * Math.PI * 2;
    const distance = 90 + (i % 3) * 22;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      rotate: (i * 47) % 360,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      round: i % 2 === 0,
    };
  });

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className={`absolute left-1/2 top-1/2 h-2.5 w-2.5 ${p.round ? "rounded-full" : "rounded-sm"}`}
          style={{ backgroundColor: p.color }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: p.y + 30, scale: [0, 1.2, 1], opacity: [1, 1, 0], rotate: p.rotate + 180 }}
          transition={{ delay: 0.3, duration: 1.4, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function NextStep({ icon: Icon, text }: { icon: typeof Mail; text: string }) {
  return (
    <li className="flex items-start gap-3 rounded-2xl bg-surface px-4 py-3 ring-1 ring-ink-900/5">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Icon size={15} />
      </span>
      <span className="text-sm leading-relaxed text-ink-700">{text}</span>
    </li>
  );
}
