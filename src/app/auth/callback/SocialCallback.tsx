"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { completeSocialSignIn } from "@/app/actions/auth";
import { buttonClass } from "@/components/ui/styles";

/** Reads the provider's token from the URL fragment and finishes sign-in on the server. */
export function SocialCallback() {
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    // Take the token out of the address bar and history straight away.
    window.history.replaceState(null, "", window.location.pathname);
    const finish = fragment.get("error")
      ? Promise.resolve({ ok: false as const, message: "Sign-in was cancelled." })
      : completeSocialSignIn({
          state: fragment.get("state") ?? "",
          idToken: fragment.get("id_token") ?? undefined,
          accessToken: fragment.get("access_token") ?? undefined,
        });
    finish
      .then((result) => {
        if (result && !result.ok) setError(result.message);
      })
      .catch(() => setError("Sign-in didn't complete. Please try again."));
  }, []);

  return (
    <div className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-card ring-1 ring-canvas-dark/60">
      {error ? (
        <>
          <h1 className="text-lg font-semibold">Couldn&apos;t sign you in</h1>
          <p className="mt-2 text-sm text-ink-500">{error}</p>
          <Link href="/sign-in" className={buttonClass("primary", "md", "mt-6")}>
            Back to sign in
          </Link>
        </>
      ) : (
        <p className="flex items-center justify-center gap-2 text-sm font-medium text-ink-700">
          <LoaderCircle aria-hidden className="size-5 animate-spin text-brand-600" /> Signing you in…
        </p>
      )}
    </div>
  );
}
