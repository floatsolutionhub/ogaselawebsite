"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import clsx from "clsx";
import { CircleCheck } from "lucide-react";

import { confirmPasswordReset, requestPasswordReset, resendPasswordReset, type FormState } from "@/app/actions/auth";
import { useToast } from "@/components/providers/ToastProvider";
import { Field, FormMessage, OtpField, PasswordField, PhoneField, SubmitButton } from "@/components/ui/Form";
import { buttonClass } from "@/components/ui/styles";

export function ForgotPasswordForm() {
  const [attempt, setAttempt] = useState(0);
  return <ResetSteps key={attempt} onRestart={() => setAttempt((n) => n + 1)} />;
}

function ResetSteps({ onRestart }: { onRestart: () => void }) {
  const [request, requestAction] = useActionState<FormState, FormData>(requestPasswordReset, { step: "form" });
  const [confirm, confirmAction] = useActionState<FormState, FormData>(confirmPasswordReset, { step: "code" });
  const [channel, setChannel] = useState<"Email" | "Phone">(request.values?.channel === "Phone" ? "Phone" : "Email");

  if (confirm.step === "done") {
    return (
      <div className="space-y-5 text-center">
        <CircleCheck aria-hidden className="mx-auto size-14 text-success" />
        <p className="text-sm text-ink-700">Your password has been changed and you&apos;ve been signed out everywhere. Sign in with your new password.</p>
        <Link href="/sign-in" className={buttonClass("primary", "lg", "w-full")}>
          Sign in
        </Link>
      </div>
    );
  }

  if (request.step === "code" && confirm.step !== "form") {
    const e = confirm.errors ?? {};
    return (
      <form action={confirmAction} className="space-y-4" noValidate>
        <p className="rounded-2xl bg-brand-50 p-4 text-sm text-brand-800 ring-1 ring-brand-100">
          If an account matches <strong className="font-semibold">{request.sentTo}</strong>, we&apos;ve sent it a 6-digit code.
        </p>
        <OtpField error={e.code} />
        <PasswordField name="newPassword" label="New password" autoComplete="new-password" minLength={8} required error={e.newPassword} hint="At least 8 characters" />
        <PasswordField name="confirmNewPassword" label="Confirm new password" autoComplete="new-password" required error={e.confirmNewPassword} />
        <FormMessage message={confirm.message} />
        <SubmitButton>Change password</SubmitButton>
        <div className="flex items-center justify-between text-sm">
          <button type="button" onClick={onRestart} className="font-medium text-ink-500 hover:text-ink-700">
            Use a different email or phone
          </button>
          <ResendCode />
        </div>
      </form>
    );
  }

  return (
    <form action={requestAction} className="space-y-5" noValidate>
      <div role="radiogroup" aria-label="Send the code to" className="grid grid-cols-2 gap-1 rounded-full bg-canvas p-1">
        {(["Email", "Phone"] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={channel === value}
            onClick={() => setChannel(value)}
            className={clsx(
              "h-10 rounded-full text-sm font-semibold transition",
              channel === value ? "bg-white text-brand-700 shadow-sm" : "text-ink-500 hover:text-ink-700",
            )}
          >
            {value}
          </button>
        ))}
      </div>
      <input type="hidden" name="channel" value={channel} />
      {channel === "Email" ? (
        <Field name="email" label="Email address" type="email" autoComplete="email" required defaultValue={request.values?.email} error={request.errors?.email} />
      ) : (
        <PhoneField name="phone" label="Phone number" required defaultValue={request.values?.phone} error={request.errors?.phone} />
      )}
      <FormMessage message={request.message ?? confirm.message} />
      <SubmitButton>Send reset code</SubmitButton>
      <p className="text-center text-sm text-ink-500">
        Remembered it?{" "}
        <Link href="/sign-in" className="font-semibold text-brand-700 hover:text-brand-600">
          Sign in
        </Link>
      </p>
    </form>
  );
}

const RESEND_SECONDS = 60;

function ResendCode() {
  const toast = useToast();
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  return (
    <button
      type="button"
      disabled={secondsLeft > 0 || sending}
      onClick={async () => {
        setSending(true);
        const result = await resendPasswordReset();
        setSending(false);
        if (result.ok) {
          toast.success("New code sent");
          setSecondsLeft(RESEND_SECONDS);
        } else {
          toast.error("Couldn't resend the code", result.message);
        }
      }}
      className="font-semibold text-brand-700 hover:text-brand-600 disabled:text-ink-300"
    >
      {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend code"}
    </button>
  );
}
