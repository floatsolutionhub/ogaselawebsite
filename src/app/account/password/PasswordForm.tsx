"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LoaderCircle } from "lucide-react";

import { changePassword } from "@/app/actions/account";
import { useToast } from "@/components/providers/ToastProvider";
import { PasswordField } from "@/components/ui/Form";
import { buttonClass, cardClass } from "@/components/ui/styles";

/** Takes effect immediately - unlike phone/email changes, no approval is needed. */
export function PasswordForm() {
  const router = useRouter();
  const toast = useToast();
  const [saving, startSaving] = useTransition();
  return (
    <form
      className={`${cardClass} space-y-4 p-6`}
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        startSaving(async () => {
          const result = await changePassword({
            currentPassword: String(form.get("currentPassword") ?? ""),
            newPassword: String(form.get("newPassword") ?? ""),
            confirmPassword: String(form.get("confirmPassword") ?? ""),
          });
          if (result.ok) {
            toast.success("Password updated");
            router.push("/account/settings");
          } else toast.error("Couldn't update your password", result.error);
        });
      }}
    >
      <p className="text-sm text-ink-500">Use at least 8 characters. You&apos;ll stay signed in here.</p>
      <PasswordField name="currentPassword" label="Current password" autoComplete="current-password" required />
      <PasswordField name="newPassword" label="New password" autoComplete="new-password" minLength={8} required />
      <PasswordField name="confirmPassword" label="Confirm new password" autoComplete="new-password" required />
      <button type="submit" disabled={saving} className={buttonClass("primary", "lg", "w-full")}>
        {saving && <LoaderCircle aria-hidden className="size-4 animate-spin" />} Update password
      </button>
    </form>
  );
}
