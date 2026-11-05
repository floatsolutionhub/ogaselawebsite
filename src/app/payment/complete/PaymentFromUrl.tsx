"use client";

import { useSearchParams } from "next/navigation";

import { PaymentResult, type PaymentOutcome } from "./PaymentResult";

/**
 * Reads the gateway's result from the URL. Paystack only redirects here after a successful charge
 * and adds ?reference=&trxref=; Flutterwave adds ?status=successful|cancelled|failed&tx_ref=.
 */
export function PaymentFromUrl() {
  const params = useSearchParams();
  const status = params.get("status")?.toLowerCase();
  const reference = params.get("reference") ?? params.get("trxref") ?? params.get("tx_ref") ?? null;

  const outcome: PaymentOutcome =
    status === "cancelled" ? "cancelled" : status === "failed" ? "failed" : "success";

  return <PaymentResult outcome={outcome} reference={reference} />;
}
