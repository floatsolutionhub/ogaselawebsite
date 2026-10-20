"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";

import { deleteAccount } from "@/app/actions/account";
import { useToast } from "@/components/providers/ToastProvider";
import { Dialog } from "@/components/ui/Dialog";
import { buttonClass, inputClass } from "@/components/ui/styles";

const WHAT_HAPPENS = [
  "Your ads are taken down straight away.",
  "Your name, phone number, email, photo and ID documents are erased.",
  "You're signed out on every device, and your Google, Apple or Facebook sign-in is unlinked.",
  "Payment records and reviews are kept without your details, as the law requires.",
];

/** Immediate and permanent (DELETE /me), behind a typed confirmation and a second check. */
export function DeleteAccountForm() {
  const toast = useToast();
  const [text, setText] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [deleting, startDeleting] = useTransition();
  const confirmed = text.trim().toUpperCase() === "DELETE";

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-danger/5 p-6 ring-1 ring-danger/20">
        <Trash2 aria-hidden className="size-7 text-danger" />
        <h2 className="mt-3 text-lg font-semibold text-danger">This is permanent</h2>
        <p className="mt-1 text-sm text-ink-700">Deleting your account happens immediately and can&apos;t be undone.</p>
        <ul className="mt-4 space-y-2 text-sm text-ink-700">
          {WHAT_HAPPENS.map((line) => (
            <li key={line} className="flex gap-2">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-danger" />
              {line}
            </li>
          ))}
        </ul>
      </section>
      <div>
        <label htmlFor="confirm-delete" className="mb-1.5 block text-sm font-medium text-ink-700">
          Type DELETE to confirm
        </label>
        <input id="confirm-delete" value={text} onChange={(e) => setText(e.target.value)} placeholder="DELETE" autoComplete="off" className={inputClass} />
      </div>
      <button type="button" onClick={() => setConfirming(true)} disabled={!confirmed || deleting} className={buttonClass("danger", "lg", "w-full")}>
        Delete my account
      </button>
      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        dismissible={!deleting}
        size="sm"
        title="Delete your account?"
        description="This can't be undone. Your account and personal data will be removed permanently."
        footer={
          <div className="flex gap-2">
            <button type="button" onClick={() => setConfirming(false)} disabled={deleting} className={buttonClass("outline", "md", "flex-1")}>
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={() =>
                startDeleting(async () => {
                  const result = await deleteAccount(text);
                  // On success the action redirects home.
                  if (result && !result.ok) {
                    setConfirming(false);
                    toast.error("Couldn't delete your account", result.error);
                  }
                })
              }
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-danger px-5 text-sm font-semibold text-white hover:bg-danger/90"
            >
              {deleting && <LoaderCircle aria-hidden className="size-4 animate-spin" />} Delete
            </button>
          </div>
        }
      />
    </div>
  );
}
