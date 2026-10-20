"use client";

import { useActionState } from "react";
import { ShieldCheck } from "lucide-react";

import { verifySignIn, type FormState } from "@/app/actions/auth";
import { FormMessage, OtpField, SubmitButton } from "@/components/ui/Form";

/** Step 2 of sign-in and sign-up: the 6-digit code. Signs in and redirects on success. */
export function CodeStep({
  sentTo,
  title,
  message,
  next,
  onRestart,
}: {
  sentTo?: string;
  title?: string;
  message?: string;
  next: string;
  onRestart: () => void;
}) {
  const [state, action] = useActionState<FormState, FormData>(verifySignIn, { step: "code" });

  return (
    <form action={action} className="space-y-5" noValidate>
      <div className="flex gap-3 rounded-2xl bg-brand-50 p-4 text-sm text-brand-800 ring-1 ring-brand-100">
        <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-brand-600" />
        <div>
          {title && <p className="font-semibold">{title}</p>}
          <p className={title ? "mt-0.5" : undefined}>
            {message ?? (
              <>
                We sent a 6-digit code to <strong className="font-semibold">{sentTo}</strong>.
              </>
            )}{" "}
            It expires in 5 minutes. Never share it. Ogasela staff will never ask for it.
          </p>
        </div>
      </div>
      <input type="hidden" name="next" value={next} />
      <OtpField error={state.errors?.code} />
      <FormMessage message={state.message} />
      <SubmitButton>Verify and continue</SubmitButton>
      <p className="text-center text-sm text-ink-500">
        Didn&apos;t get it?{" "}
        <button type="button" onClick={onRestart} className="font-semibold text-brand-700 hover:text-brand-600">
          Start again
        </button>
      </p>
    </form>
  );
}
