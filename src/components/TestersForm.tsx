"use client";

import { FormEvent, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Rocket } from "lucide-react";
import { env } from "@/config/env";
import { api, ApiError } from "@/lib/apiClient";
import { Turnstile, TurnstileHandle } from "./Turnstile";

type Status = "idle" | "submitting" | "success" | "error";

export function TestersForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileHandle>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!turnstileToken) return;

    setStatus("submitting");
    setErrorMessage("");

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      await api.post("/marketing/testers", { ...data, turnstileToken });
      setStatus("success");
      form.reset();
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
        <h3 className="mt-3 font-bold text-ink-900">You&apos;re on the list!</h3>
        <p className="mt-2 text-sm text-ink-500">
          Welcome aboard — we&apos;ll be in touch with early access details soon.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-ink-500">
        Be among the first 100 to experience the disruption we&apos;re bringing to how Nigerians
        buy and sell. Early testers get priority access, direct input into what we build next,
        and forever bragging rights for being here first.
      </p>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-700">Full name</label>
        <input
          name="name"
          type="text"
          required
          placeholder="Your full name"
          className="w-full rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-700">Email address</label>
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
      </div>

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
        disabled={status === "submitting" || !turnstileToken}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition-all hover:bg-brand-700 disabled:opacity-60"
      >
        {status === "submitting" ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Joining...
          </>
        ) : (
          <>
            <Rocket size={16} /> Join Our Testers
          </>
        )}
      </button>
    </form>
  );
}
