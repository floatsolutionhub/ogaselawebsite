"use client";

import { FormEvent, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { env } from "@/lib/marketing/env";
import { api, ApiError } from "@/lib/marketing/apiClient";
import { Turnstile, TurnstileHandle } from "./Turnstile";

type Status = "idle" | "submitting" | "success" | "error";

// Values match Ogasela.API's AccountDeletionRequestType enum exactly (serialized as strings).
const REQUEST_TYPES = [
  {
    value: "DeleteAccount",
    label: "Delete my account and associated data",
  },
  {
    value: "DeleteSpecificData",
    label: "Delete specific personal data",
  },
] as const;

export function DeletionRequestForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [requestType, setRequestType] = useState<string>("DeleteAccount");
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
      await api.post("/marketing/deletion-requests", { ...data, turnstileToken });
      setStatus("success");
      form.reset();
      setRequestType("DeleteAccount");
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
        <h3 className="mt-4 text-lg font-bold text-ink-900">Request received</h3>
        <p className="mt-2 max-w-sm text-sm text-ink-500">
          We&apos;ve received your request and will follow up by email or phone to verify
          account ownership before processing it.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-semibold text-brand-700 hover:underline"
        >
          Submit another request
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">
            Email address associated with account
          </label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">
            Phone number associated with account
          </label>
          <input
            name="phone"
            type="tel"
            placeholder="+234 800 000 0000"
            className="w-full rounded-2xl border border-ink-900/10 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium text-ink-700">Request type:</span>
        <div className="space-y-2">
          {REQUEST_TYPES.map((type) => (
            <label
              key={type.value}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm transition-colors ${
                requestType === type.value
                  ? "border-brand-400 bg-brand-50 text-brand-800"
                  : "border-ink-900/10 bg-white text-ink-700 hover:border-brand-200"
              }`}
            >
              <input
                type="radio"
                name="requestType"
                value={type.value}
                checked={requestType === type.value}
                onChange={() => setRequestType(type.value)}
                className="h-4 w-4 accent-brand-600"
              />
              {type.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-700">
          Details / additional information
        </label>
        <textarea
          name="details"
          rows={4}
          placeholder={
            requestType === "DeleteSpecificData"
              ? "Let us know which specific data you'd like deleted (e.g. a listing, a review, your chat history)."
              : "Optional: anything else we should know?"
          }
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
            <Loader2 size={16} className="animate-spin" /> Submitting...
          </>
        ) : (
          <>
            <Trash2 size={16} /> Submit Request
          </>
        )}
      </button>

      <div className="space-y-2 border-t border-ink-900/10 pt-5 text-xs leading-relaxed text-ink-500">
        <p>We may contact you to verify account ownership before processing your request.</p>
        <p>
          Some information may be retained where required for legal, security,
          fraud-prevention, accounting, or regulatory purposes. Details are available in our{" "}
          <a href="/privacy-policy" className="text-brand-700 hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </form>
  );
}
