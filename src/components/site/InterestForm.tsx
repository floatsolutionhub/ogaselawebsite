"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BellRing, CheckCircle2, Loader2, Rocket } from "lucide-react";
import { env } from "@/lib/marketing/env";
import { api, ApiError } from "@/lib/marketing/apiClient";
import { NIGERIAN_STATES } from "@/lib/marketing/nigeria";
import { Turnstile, TurnstileHandle } from "./Turnstile";

export type InterestKind = "tester" | "waitlist";

type Status = "idle" | "submitting" | "success" | "error";

const inputClasses =
  "w-full rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

// Values match Ogasela.API's InterestIntent / InterestDevicePlatform enums (serialized as strings).
// Both forms ask for the phone's OS: testers get the right build, waiting-list signups the right store link.
const INTENTS = [
  { value: "Buy", label: "Buy" },
  { value: "Sell", label: "Sell" },
  { value: "Both", label: "Both" },
] as const;

const DEVICES = [
  { value: "Android", label: "Android" },
  { value: "IOS", label: "iPhone (iOS)" },
] as const;

const COPY: Record<InterestKind, { intro: string; button: string; doneTitle: string; doneBody: string; endpoint: string }> = {
  tester: {
    intro:
      "Try Ogasela before anyone else. Testers get pre-release builds, a direct line to the team, and a real say in what we fix and build next. We're starting with a small group, so tell us which phone you'll use.",
    button: "Join our testers",
    doneTitle: "Thanks for volunteering!",
    doneBody:
      "We've sent a confirmation to your email. When a test build is ready for your phone, we'll email you how to install it and share feedback.",
    endpoint: "/marketing/testers",
  },
  waitlist: {
    intro:
      "Ogasela isn't in the App Store or Google Play just yet. Leave your details, tell us which phone you use, and we'll email you the right download link the moment it's live.",
    button: "Join waiting list",
    doneTitle: "You're on the list!",
    doneBody: "We've sent a confirmation to your email, and we'll send you the download link for your phone as soon as the app is available.",
    endpoint: "/marketing/waitlist",
  },
};

/** "Join our testers" and "Join waiting list" - same fields, different endpoint and wording. */
export function InterestForm({ kind }: { kind: InterestKind }) {
  const copy = COPY[kind];
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [intent, setIntent] = useState<string>("Both");
  const [device, setDevice] = useState<string>("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileHandle>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!turnstileToken) return;

    setStatus("submitting");
    setErrorMessage("");

    const form = event.currentTarget;
    const data = new FormData(form);
    const optional = (name: string) => String(data.get(name) ?? "").trim() || null;

    try {
      await api.post(copy.endpoint, {
        name: String(data.get("name") ?? "").trim(),
        email: String(data.get("email") ?? "").trim(),
        phone: optional("phone"),
        state: optional("state"),
        intent,
        devicePlatform: device || null,
        consent: data.get("consent") === "on",
        turnstileToken,
      });
      setStatus("success");
      form.reset();
      setDevice("");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof ApiError ? error.message : "Something went wrong. Please try again.");
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    }
  }

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center rounded-2xl bg-brand-50 p-8 text-center"
      >
        <CheckCircle2 size={36} className="text-brand-600" />
        <h3 className="mt-3 font-bold text-ink-900">{copy.doneTitle}</h3>
        <p className="mt-2 text-sm text-ink-500">{copy.doneBody}</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-ink-500">{copy.intro}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor={`${kind}-name`} className="mb-1.5 block text-sm font-medium text-ink-700">
            Full name
          </label>
          <input id={`${kind}-name`} name="name" type="text" required maxLength={200} placeholder="Your full name" className={inputClasses} />
        </div>
        <div>
          <label htmlFor={`${kind}-email`} className="mb-1.5 block text-sm font-medium text-ink-700">
            Email address
          </label>
          <input id={`${kind}-email`} name="email" type="email" required maxLength={320} placeholder="you@example.com" className={inputClasses} />
        </div>
        <div>
          <label htmlFor={`${kind}-phone`} className="mb-1.5 block text-sm font-medium text-ink-700">
            Phone <span className="font-normal text-ink-300">(optional)</span>
          </label>
          <input
            id={`${kind}-phone`}
            name="phone"
            type="tel"
            inputMode="tel"
            maxLength={14}
            placeholder="08031234567"
            className={inputClasses}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${kind}-state`} className="mb-1.5 block text-sm font-medium text-ink-700">
            State <span className="font-normal text-ink-300">(optional)</span>
          </label>
          <select id={`${kind}-state`} name="state" defaultValue="" className={inputClasses}>
            <option value="">Select your state</option>
            {NIGERIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <ChoiceGroup
            label={kind === "tester" ? "I'll test on" : "My phone is"}
            name="device"
            options={DEVICES}
            value={device}
            onChange={setDevice}
            required
          />
        </div>
      </div>

      <ChoiceGroup label="I want to" name="intent" options={INTENTS} value={intent} onChange={setIntent} />

      <label className="flex items-start gap-3 rounded-2xl bg-surface p-4 text-xs leading-relaxed text-ink-500">
        <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 flex-shrink-0 accent-brand-600" />
        <span>
          I&apos;m 18 or older and I agree that Ogasela may store these details and contact me by email (or phone, if
          given) about {kind === "tester" ? "testing the app" : "the app's launch"}. I can ask to be removed at any
          time. See our{" "}
          <Link href="/privacy-policy" target="_blank" className="font-semibold text-brand-700 hover:underline">
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      <Turnstile
        ref={turnstileRef}
        siteKey={env.turnstileSiteKey}
        onVerify={setTurnstileToken}
        onExpire={() => setTurnstileToken(null)}
      />

      {status === "error" && (
        <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting" || !turnstileToken || !device}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition-all hover:bg-brand-700 disabled:opacity-60"
      >
        {status === "submitting" ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Joining...
          </>
        ) : (
          <>
            {kind === "tester" ? <Rocket size={16} /> : <BellRing size={16} />} {copy.button}
          </>
        )}
      </button>
    </form>
  );
}

function ChoiceGroup({
  label,
  name,
  options,
  value,
  onChange,
  required,
}: {
  label: string;
  name: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 block text-sm font-medium text-ink-700">{label}</legend>
      <div className="flex gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex flex-1 cursor-pointer items-center justify-center rounded-2xl border px-3 py-3 text-sm font-medium transition-colors ${
              value === option.value
                ? "border-brand-400 bg-brand-50 text-brand-800"
                : "border-ink-900/10 bg-white text-ink-700 hover:border-brand-200"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              required={required}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
