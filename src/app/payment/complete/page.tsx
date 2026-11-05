import type { Metadata } from "next";
import { Suspense } from "react";

import { PaymentFromUrl } from "./PaymentFromUrl";

export const metadata: Metadata = {
  title: "Payment complete",
  description: "Your Ogasela payment result.",
  robots: { index: false, follow: false },
};

/**
 * Where Paystack and Flutterwave send the payer after checkout (Payments:*:CallbackUrl/RedirectUrl
 * in the API). The app opens checkout in an auth session waiting for the ogasela:// link this page
 * sends. A static page - the result is read from the URL in the browser.
 */
export default function PaymentCompletePage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <PaymentFromUrl />
    </Suspense>
  );
}
