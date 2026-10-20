import "server-only";

import { cookies, headers } from "next/headers";

import { env } from "@/config/env";
import { COOKIE } from "@/lib/auth/cookies";
import type { ProblemDetails } from "./types";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

const TIMEOUT_MS = 20_000;
/** Uploads carry several MB. */
const UPLOAD_TIMEOUT_MS = 120_000;

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** JSON-serialised, or sent as multipart when it's FormData. */
  body?: unknown;
  /** Send the signed-in user's access token. Default true; public reads still work signed out. */
  auth?: boolean;
};

/**
 * Only plain relative API paths are allowed - no scheme, host, "..", or backslashes - so a value
 * that came from a URL can never point the server's fetch somewhere else.
 */
function assertSafePath(path: string): void {
  if (!/^\/[A-Za-z0-9\-._~/?=&%,+]*$/.test(path) || path.includes("..") || path.startsWith("//")) {
    throw new ApiError(400, "Invalid request.");
  }
}

/**
 * The visitor's IP, passed on so the API can log and rate-limit per visitor rather than per web
 * server. Taken from what the reverse proxy in front of this app set (X-Real-IP, or the last
 * X-Forwarded-For hop it appended) - the first X-Forwarded-For entry is whatever the client sent.
 */
async function clientIp(): Promise<string | null> {
  const h = await headers();
  const realIp = h.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const hops = h.get("x-forwarded-for")?.split(",").map((hop) => hop.trim()).filter(Boolean);
  return hops?.at(-1) ?? null;
}

/** Server-side call to Ogasela.API. Never import this from a Client Component. */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  assertSafePath(path);
  const { method = "GET", body, auth = true } = options;

  const isForm = body instanceof FormData;
  const requestHeaders = new Headers({ Accept: "application/json" });
  // FormData sets its own multipart boundary - never override it.
  if (body !== undefined && !isForm) requestHeaders.set("Content-Type", "application/json");
  if (auth) {
    const token = (await cookies()).get(COOKIE.access)?.value;
    if (token) requestHeaders.set("Authorization", `Bearer ${token}`);
  }
  const ip = await clientIp();
  if (ip) requestHeaders.set("X-Forwarded-For", ip);

  let response: Response;
  try {
    response = await fetch(`${env.apiUrl}${path}`, {
      method,
      headers: requestHeaders,
      body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(isForm ? UPLOAD_TIMEOUT_MS : TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    throw new ApiError(
      0,
      timedOut
        ? "Ogasela is taking too long to respond. Please try again."
        : "We couldn't reach Ogasela right now. Please try again shortly.",
      "Network",
    );
  }

  if (response.status === 204) return undefined as T;

  const contentType = response.headers.get("content-type") ?? "";
  const data: unknown = contentType.includes("json") ? await response.json().catch(() => undefined) : undefined;

  if (!response.ok) {
    const problem = data as ProblemDetails | undefined;
    // ASP.NET validation failures carry the useful message in `errors`, not title/detail.
    const fieldErrors = problem?.errors ? Object.values(problem.errors).flat() : [];
    const message =
      fieldErrors.length > 0
        ? fieldErrors.join(" ")
        : (problem?.detail ?? problem?.title ?? (response.status >= 500 ? "Something went wrong on our side." : "Request failed."));
    throw new ApiError(response.status, message, problem?.title);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, auth = true) => apiRequest<T>(path, { auth }),
  post: <T>(path: string, body?: unknown, auth = true) => apiRequest<T>(path, { method: "POST", body, auth }),
  put: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "PATCH", body }),
  del: <T>(path: string) => apiRequest<T>(path, { method: "DELETE" }),
  postForm: <T>(path: string, form: FormData) => apiRequest<T>(path, { method: "POST", body: form }),
};

/** The value, or null if the call failed - so pages can fetch first and render after. */
export async function settle<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch {
    return null;
  }
}

/** A message that's safe to show the user for any thrown value. */
export function userMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error instanceof ApiError) {
    if (error.status === 429) return "Too many attempts. Please wait a minute and try again.";
    if (error.status >= 500) return "Something went wrong on our side. Please try again shortly.";
    return error.message || fallback;
  }
  return fallback;
}
