"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import clsx from "clsx";
import { CircleAlert, Eye, EyeOff, LoaderCircle } from "lucide-react";

import { normalizePhone } from "@/lib/validation";
import { buttonClass, inputClass } from "./styles";

type FieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> & {
  name: string;
  label: string;
  error?: string;
  hint?: string;
};

export function Field({ name, label, error, hint, className, ...input }: FieldProps) {
  const id = `field-${name}`;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-700">
        {label}
      </label>
      <input id={id} name={name} aria-invalid={error ? true : undefined} aria-describedby={describedBy} className={inputClass} {...input} />
      <FieldNote id={id} error={error} hint={hint} />
    </div>
  );
}

function FieldNote({ id, error, hint }: { id: string; error?: string; hint?: string }) {
  if (error) {
    return (
      <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1 text-xs font-medium text-danger">
        <CircleAlert aria-hidden className="size-3.5" /> {error}
      </p>
    );
  }
  return hint ? <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-500">{hint}</p> : null;
}

/** Digits only, 11 max - the same as the app's phone inputs. */
export function PhoneField(props: Omit<FieldProps, "type" | "inputMode" | "onChange" | "value">) {
  const [value, setValue] = useState(typeof props.defaultValue === "string" ? normalizePhone(props.defaultValue) : "");
  const { defaultValue: _ignored, ...rest } = props;
  void _ignored;
  return (
    <Field
      {...rest}
      type="tel"
      inputMode="numeric"
      autoComplete="tel-national"
      maxLength={11}
      placeholder="08012345678"
      value={value}
      onChange={(event) => setValue(normalizePhone(event.target.value))}
    />
  );
}

export function PasswordField(props: Omit<FieldProps, "type">) {
  const [visible, setVisible] = useState(false);
  const id = `field-${props.name}`;
  const { label, error, hint, className, ...input } = props;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={clsx(inputClass, "pr-12")}
          maxLength={128}
          {...input}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-ink-500 hover:bg-brand-50 hover:text-brand-700"
        >
          {visible ? <EyeOff aria-hidden className="size-[18px]" /> : <Eye aria-hidden className="size-[18px]" />}
        </button>
      </div>
      <FieldNote id={id} error={error} hint={hint} />
    </div>
  );
}

export function SubmitButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={buttonClass("primary", "lg", clsx("w-full", className))}>
      {pending && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export function FormMessage({ message, tone = "error" }: { message?: string; tone?: "error" | "success" }) {
  if (!message) return null;
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={clsx(
        "flex items-start gap-2 rounded-xl px-4 py-3 text-sm font-medium",
        tone === "error" ? "bg-danger/8 text-danger ring-1 ring-danger/20" : "bg-brand-50 text-brand-800 ring-1 ring-brand-100",
      )}
    >
      <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" /> {message}
    </p>
  );
}

export function OtpField({ error }: { error?: string }) {
  const [value, setValue] = useState("");
  return (
    <div>
      <label htmlFor="field-code" className="mb-1.5 block text-sm font-medium text-ink-700">
        6-digit code
      </label>
      <input
        id="field-code"
        name="code"
        value={value}
        onChange={(event) => setValue(event.target.value.replace(/\D/g, "").slice(0, 6))}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        autoFocus
        required
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "field-code-error" : undefined}
        placeholder="••••••"
        className={clsx(inputClass, "text-center text-2xl font-semibold tracking-[0.6em]")}
      />
      <FieldNote id="field-code" error={error} />
    </div>
  );
}
