"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import clsx from "clsx";
import { Mail, Smartphone } from "lucide-react";

import { signIn, type FormState } from "@/app/actions/auth";
import { Field, FormMessage, PasswordField, PhoneField, SubmitButton } from "@/components/ui/Form";
import { CodeStep } from "./CodeStep";
import { SocialButtons } from "./SocialButtons";

export function SignInForm({ next }: { next: string }) {
  // Remounting resets both steps - used by "Start again".
  const [attempt, setAttempt] = useState(0);
  return <SignInSteps key={attempt} next={next} onRestart={() => setAttempt((n) => n + 1)} />;
}

function SignInSteps({ next, onRestart }: { next: string; onRestart: () => void }) {
  const [state, action] = useActionState<FormState, FormData>(signIn, { step: "form" });
  const [method, setMethod] = useState<"email" | "phone">(state.values?.method === "phone" ? "phone" : "email");

  if (state.step === "code") {
    return <CodeStep sentTo={state.sentTo} title={state.codeTitle} message={state.codeMessage} next={next} onRestart={onRestart} />;
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      <div role="radiogroup" aria-label="Sign in with" className="grid grid-cols-2 gap-1 rounded-full bg-canvas p-1">
        {(
          [
            { value: "email", label: "Email", icon: Mail },
            { value: "phone", label: "Phone", icon: Smartphone },
          ] as const
        ).map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={method === value}
            onClick={() => setMethod(value)}
            className={clsx(
              "inline-flex h-10 items-center justify-center gap-2 rounded-full text-sm font-semibold transition",
              method === value ? "bg-white text-brand-700 shadow-sm" : "text-ink-500 hover:text-ink-700",
            )}
          >
            <Icon aria-hidden className="size-4" /> {label}
          </button>
        ))}
      </div>
      <input type="hidden" name="method" value={method} />

      {method === "email" ? (
        <Field
          name="email"
          label="Email address"
          type="email"
          autoComplete="email"
          maxLength={254}
          required
          defaultValue={state.values?.email}
          error={state.errors?.email}
        />
      ) : (
        <PhoneField name="phone" label="Phone number" required defaultValue={state.values?.phone} error={state.errors?.phone} />
      )}

      <div>
        <PasswordField name="password" label="Password" autoComplete="current-password" required error={state.errors?.password} />
        <Link href="/forgot-password" className="mt-2 inline-block text-sm font-medium text-brand-700 hover:text-brand-600">
          Forgot password?
        </Link>
      </div>

      <FormMessage message={state.message} />
      <SubmitButton>Continue</SubmitButton>

      <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-ink-300">
        <span className="h-px flex-1 bg-canvas-dark" /> or <span className="h-px flex-1 bg-canvas-dark" />
      </div>
      <SocialButtons next={next} />

      <p className="text-center text-sm text-ink-500">
        New to Ogasela?{" "}
        <Link href={`/sign-up${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-brand-700 hover:text-brand-600">
          Open your stall
        </Link>
      </p>
    </form>
  );
}
