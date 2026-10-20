"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState } from "react";

import { signUp, type FormState } from "@/app/actions/auth";
import { Field, FormMessage, PasswordField, PhoneField, SubmitButton } from "@/components/ui/Form";
import { site } from "@/config/site";
import { CodeStep } from "./CodeStep";

export function SignUpForm({ next }: { next: string }) {
  return <SignUpSteps next={next} />;
}

function SignUpSteps({ next }: { next: string }) {
  const router = useRouter();
  const [state, action] = useActionState<FormState, FormData>(signUp, { step: "form" });
  const e = state.errors ?? {};

  // The account exists now - "Start again" goes to sign in rather than signing up twice.
  if (state.step === "code") {
    return (
      <CodeStep
        sentTo={state.sentTo}
        title={state.codeTitle}
        message={state.codeMessage}
        next={next}
        onRestart={() => router.push("/sign-in")}
      />
    );
  }

  return (
    <form action={action} className="space-y-4" noValidate>
      <Field name="fullName" label="Full name" autoComplete="name" maxLength={100} required defaultValue={state.values?.fullName} error={e.fullName} />
      <Field
        name="businessName"
        label="Shop or business name"
        autoComplete="organization"
        maxLength={100}
        required
        defaultValue={state.values?.businessName}
        error={e.businessName}
        hint="Buyers see this on your stall. Use your own name if you sell as an individual."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="email" label="Email address" type="email" autoComplete="email" maxLength={254} required defaultValue={state.values?.email} error={e.email} />
        <PhoneField name="phone" label="Phone number" required defaultValue={state.values?.phone} error={e.phone} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <PasswordField name="password" label="Password" autoComplete="new-password" minLength={8} required error={e.password} hint="At least 8 characters" />
        <PasswordField name="confirmPassword" label="Confirm password" autoComplete="new-password" required error={e.confirmPassword} />
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-ink-700">
          <input type="checkbox" name="acceptedTerms" className="mt-0.5 size-4 shrink-0 accent-brand-600" aria-invalid={e.acceptedTerms ? true : undefined} />
          <span>
            I agree to Ogasela&apos;s{" "}
            <a href={site.links.terms} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 underline-offset-2 hover:underline">
              Terms
            </a>{" "}
            and{" "}
            <a href={site.links.privacy} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 underline-offset-2 hover:underline">
              Privacy Notice
            </a>
            .
          </span>
        </label>
        {e.acceptedTerms && <p className="mt-1.5 text-xs font-medium text-danger">{e.acceptedTerms}</p>}
      </div>

      <FormMessage message={state.message} />
      <SubmitButton>Create my account</SubmitButton>
      <p className="text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-brand-700 hover:text-brand-600">
          Sign in
        </Link>
      </p>
    </form>
  );
}
