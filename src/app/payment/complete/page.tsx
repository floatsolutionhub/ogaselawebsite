import type { Metadata } from "next";
import { PaymentResult, type PaymentOutcome } from "./PaymentResult";

export const metadata: Metadata = {
  title: "Payment complete",
  description: "Your Ogasela payment result.",
  robots: { index: false, follow: false },
};

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/**
 * Where Paystack and Flutterwave send the payer after checkout (Payments:*:CallbackUrl/RedirectUrl
 * in the API). Paystack only redirects here after a successful charge and adds
 * ?reference=&trxref=; Flutterwave adds ?status=successful|cancelled|failed&tx_ref=.
 * The app opens checkout in an auth session waiting for the ogasela:// link this page sends.
 */
export default async function PaymentCompletePage(props: PageProps<"/payment/complete">) {
  const params = await props.searchParams;
  const status = first(params.status)?.toLowerCase();
  const reference = first(params.reference) ?? first(params.trxref) ?? first(params.tx_ref) ?? null;

  const outcome: PaymentOutcome =
    status === "cancelled" ? "cancelled" : status === "failed" ? "failed" : "success";

  return <PaymentResult outcome={outcome} reference={reference} />;
}
