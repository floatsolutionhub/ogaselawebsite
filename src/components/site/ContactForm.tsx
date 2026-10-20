"use client";

import { FormEvent, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { env } from "@/lib/marketing/env";
import { api, ApiError } from "@/lib/marketing/apiClient";
import { Turnstile, TurnstileHandle } from "./Turnstile";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
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
      await api.post("/marketing/contact", { ...data, turnstileToken });
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
        className="flex flex-col items-center rounded-3xl bg-brand-50 p-10 text-center"
      >
        <CheckCircle2 size={40} className="text-brand-600" />
        <h3 className="mt-4 text-lg font-bold text-ink-900">Message sent</h3>
        <p className="mt-2 max-w-sm text-sm text-ink-500">
          Thanks for reaching out. Our team will get back to you as soon as possible.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-semibold text-brand-700 hover:underline"
        >
          Send another message
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" name="name" type="text" required placeholder="Your full name" />
        <Field label="Email address" name="email" type="email" required placeholder="you@example.com" />
      </div>
      <Field label="Subject" name="subject" type="text" required placeholder="How can we help?" />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-700">Message</label>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Tell us more..."
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
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition-all hover:bg-brand-700 disabled:opacity-60 sm:w-auto"
      >
        {status === "submitting" ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Sending...
          </>
        ) : (
          <>
            <Send size={16} /> Send message
          </>
        )}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink-700">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
      />
    </div>
  );
}
