"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Clock, LoaderCircle, ShieldCheck } from "lucide-react";

import { settleCheckout, type SettleResult } from "@/app/actions/sell";
import { useToast } from "@/components/providers/ToastProvider";
import { buttonClass } from "@/components/ui/styles";

/** How long to keep asking before leaving it to the gateway's webhook (as the app does). */
const ATTEMPTS = 5;
const DELAY_MS = 2000;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function PaymentResult({ cancelled }: { cancelled: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [state, setState] = useState<{ phase: "checking" } | { phase: "pending"; next: string } | { phase: "error"; message: string } | { phase: "none" }>({
    phase: "checking",
  });
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      let last: SettleResult | null = null;
      for (let attempt = 0; attempt < (cancelled ? 1 : ATTEMPTS); attempt++) {
        const result = await settleCheckout(cancelled ? "cancel" : "confirm");
        if (!result.ok) {
          setState({ phase: "error", message: result.error });
          return;
        }
        last = result.data;
        if (last.status !== "pending") break;
        await wait(DELAY_MS);
      }
      if (!last || last.status === "none") {
        setState({ phase: "none" });
        return;
      }
      if (last.status === "pending") {
        setState({ phase: "pending", next: last.next });
        return;
      }
      if (last.status === "paid") toast.success(last.title, last.body);
      else toast.info(last.title, last.body);
      router.replace(last.next);
    })();
  }, [cancelled, router, toast]);

  return (
    <div className="rounded-3xl bg-white p-8 text-center shadow-card ring-1 ring-canvas-dark/60">
      {state.phase === "checking" && (
        <>
          <LoaderCircle aria-hidden className="mx-auto size-10 animate-spin text-brand-600" />
          <h1 className="mt-4 text-xl font-semibold">{cancelled ? "Checking your payment…" : "Confirming your payment…"}</h1>
          <p className="mt-2 text-sm text-ink-500">This usually takes a few seconds. Please don&apos;t close this page.</p>
        </>
      )}
      {state.phase === "pending" && (
        <>
          <Clock aria-hidden className="mx-auto size-10 text-gold-600" />
          <h1 className="mt-4 text-xl font-semibold">Waiting for your bank</h1>
          <p className="mt-2 text-sm text-ink-500">
            Your bank hasn&apos;t confirmed the payment yet. We&apos;ll finish up automatically as soon as it does. You don&apos;t need to pay again.
          </p>
          <Link href={state.next} className={buttonClass("primary", "md", "mt-6")}>
            Continue
          </Link>
        </>
      )}
      {state.phase === "error" && (
        <>
          <h1 className="text-xl font-semibold">We couldn&apos;t check your payment</h1>
          <p className="mt-2 text-sm text-ink-500">{state.message}</p>
          <Link href="/my-ads" className={buttonClass("primary", "md", "mt-6")}>
            Go to My ads
          </Link>
        </>
      )}
      {state.phase === "none" && (
        <>
          <ShieldCheck aria-hidden className="mx-auto size-10 text-brand-600" />
          <h1 className="mt-4 text-xl font-semibold">Nothing waiting here</h1>
          <p className="mt-2 text-sm text-ink-500">This payment has already been handled.</p>
          <div className="mt-6 flex justify-center gap-2">
            <Link href="/my-ads" className={buttonClass("outline", "md")}>
              My ads
            </Link>
            <Link href="/office-pickups" className={buttonClass("outline", "md")}>
              Office pickups
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
