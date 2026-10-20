"use client";

import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";

import { confirmContactChange, sendContactCode, withdrawChange } from "@/app/actions/account";
import { ChangeRequestBanner } from "@/components/account/ChangeRequestBanner";
import { useToast } from "@/components/providers/ToastProvider";
import { OtpField } from "@/components/ui/Form";
import { buttonClass, cardClass, inputClass } from "@/components/ui/styles";
import type { ProfileChange } from "@/lib/api/types";
import { normalizePhone, PHONE_REGEX } from "@/lib/validation";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Change phone or email: the new one is confirmed with a code sent to it, then filed for staff
 * approval. The current one stays in use until it's approved.
 */
export function ChangeContact({ kind, current, change: initialChange }: { kind: "Phone" | "Email"; current: string | null; change?: ProfileChange }) {
  const toast = useToast();
  const isPhone = kind === "Phone";
  const label = isPhone ? "phone number" : "email";
  const [step, setStep] = useState<"enter" | "code">("enter");
  const [value, setValue] = useState("");
  const [change, setChange] = useState(initialChange);
  const [busy, startBusy] = useTransition();
  const [withdrawing, startWithdrawing] = useTransition();

  const trimmed = isPhone ? value.trim() : value.trim().toLowerCase();
  const valid = isPhone ? PHONE_REGEX.test(trimmed) : EMAIL.test(trimmed);
  const sameAsCurrent = !!current && trimmed === (isPhone ? current : current.toLowerCase());
  const hasPending = change?.status === "PendingReview";

  const sendCode = () =>
    startBusy(async () => {
      const result = await sendContactCode(kind, trimmed);
      if (result.ok) {
        setStep("code");
        toast.success("Code sent", `Check ${trimmed} for a 6-digit code.`);
      } else toast.error("Couldn't send the code", result.error);
    });

  return (
    <div className="space-y-6">
      <ChangeRequestBanner
        change={change}
        pendingText={`New ${label}: ${change?.newValue ?? ""}`}
        withdrawing={withdrawing}
        onWithdraw={() =>
          startWithdrawing(async () => {
            if (!change) return;
            const result = await withdrawChange(change.id);
            if (result.ok) {
              setChange({ ...change, status: "Cancelled" });
              toast.success("Request withdrawn");
            } else toast.error("Couldn't withdraw the request", result.error);
          })
        }
      />

      <section className={`${cardClass} space-y-5 p-6`}>
        <div>
          <p className="text-sm text-ink-500">Current {label}</p>
          <p className="mt-0.5 font-semibold">{current || "Not set"}</p>
        </div>

        {step === "enter" ? (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (valid && !sameAsCurrent && !hasPending) sendCode();
            }}
          >
            <div>
              <label htmlFor="new-contact" className="mb-1.5 block text-sm font-medium text-ink-700">
                New {label}
              </label>
              <input
                id="new-contact"
                type={isPhone ? "tel" : "email"}
                inputMode={isPhone ? "numeric" : "email"}
                value={value}
                onChange={(e) => setValue(isPhone ? normalizePhone(e.target.value) : e.target.value)}
                maxLength={isPhone ? 11 : 254}
                placeholder={isPhone ? "08012345678" : "you@example.com"}
                autoComplete={isPhone ? "tel-national" : "email"}
                aria-invalid={value.length > 0 && (sameAsCurrent || !valid) ? true : undefined}
                className={inputClass}
              />
              {value.length > 0 && (sameAsCurrent || !valid) && (
                <p className="mt-1.5 text-xs font-medium text-danger">
                  {sameAsCurrent ? `That's already your ${label}` : isPhone ? "Enter an 11-digit phone number, e.g. 08012345678" : "Enter a valid email address"}
                </p>
              )}
            </div>
            <p className="text-sm text-ink-500">
              We&apos;ll send a code to the new {label} to confirm it&apos;s yours. After that, our team reviews the change before it takes effect.
            </p>
            <button type="submit" disabled={!valid || sameAsCurrent || hasPending || busy} className={buttonClass("primary", "lg", "w-full")}>
              {busy && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
              {hasPending ? "Waiting for review" : "Send code"}
            </button>
          </form>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const code = String(new FormData(event.currentTarget).get("code") ?? "");
              startBusy(async () => {
                const result = await confirmContactChange(kind, trimmed, code);
                if (result.ok) {
                  setChange(result.data);
                  setStep("enter");
                  setValue("");
                  toast.success("Sent for approval", "We'll notify you once it's reviewed.");
                } else toast.error("Couldn't confirm the code", result.error);
              });
            }}
          >
            <p className="text-sm text-ink-700">
              Enter the 6-digit code sent to <strong>{trimmed}</strong>.
            </p>
            <OtpField />
            <button type="submit" disabled={busy} className={buttonClass("primary", "lg", "w-full")}>
              {busy && <LoaderCircle aria-hidden className="size-4 animate-spin" />} Submit for approval
            </button>
            <div className="flex justify-between text-sm">
              <button type="button" onClick={() => setStep("enter")} className="font-medium text-ink-500 hover:text-ink-700">
                Change {label}
              </button>
              <button type="button" onClick={sendCode} disabled={busy} className="font-semibold text-brand-700">
                Resend code
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
