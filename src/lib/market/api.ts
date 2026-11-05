import { env } from "@/config/env";
import { ApiError } from "@/lib/apiClient";
import type { Announcement, ProblemDetails, Testimonial } from "./types";

// The public Ogasela.API content the homepage shows (announcements and testimonials), read from
// the browser - the site is static, so there's no server of ours in between.

const TIMEOUT_MS = 15_000;

/**
 * Only plain relative API paths are allowed - no scheme, host, "..", or backslashes - so a value
 * that came from a URL can never point the server's fetch somewhere else.
 */
function assertSafePath(path: string): void {
  if (!/^\/[A-Za-z0-9\-._~/?=&%,+]*$/.test(path) || path.includes("..") || path.startsWith("//")) {
    throw new ApiError(400, "Invalid request.");
  }
}

async function get<T>(path: string): Promise<T> {
  assertSafePath(path);
  let response: Response;
  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      headers: { Accept: "application/json" },
      redirect: "error",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new ApiError(0, "We couldn't reach Ogasela right now. Please try again shortly.", "Network");
  }

  const contentType = response.headers.get("content-type") ?? "";
  const data: unknown = contentType.includes("json") ? await response.json().catch(() => undefined) : undefined;
  if (!response.ok) {
    const problem = data as ProblemDetails | undefined;
    throw new ApiError(response.status, problem?.detail ?? problem?.title ?? "Request failed.", problem?.title);
  }
  return data as T;
}

/** The value, or null if the call failed - so a section can hide itself instead of erroring. */
export async function settle<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch {
    return null;
  }
}

export const getActiveAnnouncements = () => get<Announcement[]>("/announcements/active");
export const getTestimonials = () => get<Testimonial[]>("/testimonials");
