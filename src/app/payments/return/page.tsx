import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { requireUser } from "@/lib/auth/session";
import { PaymentResult } from "./PaymentResult";

export const metadata: Metadata = { title: "Payment", robots: { index: false } };

/**
 * Where Paystack/Flutterwave send the payer back to (Ogasela.API passes this page as the
 * checkout's return URL). What was paid for is in a server-side cookie; the gateway's own query
 * string is only used to tell a cancelled payment from a completed one.
 */
export default async function PaymentReturnPage({ searchParams }: PageProps<"/payments/return">) {
  await requireUser("/payments/return");
  const status = (await searchParams).status;
  // Flutterwave adds ?status=cancelled when the payer backs out.
  const cancelled = status === "cancelled";
  return (
    <Container className="max-w-xl py-16">
      <PaymentResult cancelled={cancelled} />
    </Container>
  );
}
