import "server-only";

import { ApiError, userMessage } from "@/lib/api/client";
import type { CurrentUser } from "@/lib/api/types";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * What every Server Action returns to the browser. Actions never throw to the client: Next hides
 * thrown messages in production anyway, so a failure comes back as a message that's safe to show.
 */
export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string; code?: string };

export const ok = <T>(data: T): ActionResult<T> => ({ ok: true, data });

export function fail(error: unknown, fallback?: string): { ok: false; error: string; code?: string } {
  if (typeof error === "string") return { ok: false, error };
  return { ok: false, error: userMessage(error, fallback), code: error instanceof ApiError ? error.code : undefined };
}

/**
 * Runs an action for the signed-in user. Every action re-checks the session itself - never
 * trust that a page was protected, since actions can be called directly.
 */
export async function withUser<T>(
  fn: (user: CurrentUser) => Promise<T>,
  fallback?: string,
): Promise<ActionResult<T>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Your session has ended. Please sign in again.", code: "SignedOut" };
  try {
    return ok(await fn(user));
  } catch (error) {
    return fail(error, fallback);
  }
}
