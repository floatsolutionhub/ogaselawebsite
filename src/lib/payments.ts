import "server-only";

import { cookies } from "next/headers";
import { z } from "zod";

import { env } from "@/config/env";
import { baseCookie, COOKIE } from "@/lib/auth/cookies";

// Card checkouts: the browser goes to the gateway's page, and the gateway sends it back to
// /payments/return (allowed by Ogasela.API's Payments:AllowedReturnUrls). What was being paid for
// is remembered here, server-side, so the return page knows what to confirm.

export const CHECKOUT_COOKIE = "og_checkout";
/** Paying can take a while (OTPs, bank apps) - that isn't inactivity. */
const PAYMENT_GRACE_MS = 30 * 60_000;

const checkoutSchema = z.object({
  /** listing: paying for a new or renewed ad. upgrade: moving a running ad onto a bigger plan. */
  kind: z.enum(["listing", "upgrade", "pickup"]),
  id: z.string().uuid().or(z.string().regex(/^[0-9a-f-]{36}$/i)),
  reference: z.string().min(1).max(200),
});

export type PendingCheckout = z.infer<typeof checkoutSchema>;

export function paymentReturnUrl(): string {
  return `${env.publicUrl}/payments/return`;
}

export async function rememberCheckout(checkout: PendingCheckout): Promise<void> {
  const jar = await cookies();
  jar.set(CHECKOUT_COOKIE, JSON.stringify(checkout), { ...baseCookie, maxAge: 2 * 60 * 60 });
  // Hold off the idle sign-out while they're on the payment page (src/proxy.ts reads this as
  // "last active" - set in the future, it counts as active until then).
  jar.set(COOKIE.seen, String(Date.now() + PAYMENT_GRACE_MS), { ...baseCookie, maxAge: 30 * 24 * 3600 });
}

export async function readCheckout(): Promise<PendingCheckout | null> {
  const raw = (await cookies()).get(CHECKOUT_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = checkoutSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export async function forgetCheckout(): Promise<void> {
  (await cookies()).delete({ name: CHECKOUT_COOKIE, ...baseCookie });
}
