import { env } from "@/config/env";

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

interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");

  const response = await fetch(`${env.apiBaseUrl}${path}`, { ...options, headers });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("json") ? await response.json() : undefined;

  if (!response.ok) {
    const problem = body as ProblemDetails | undefined;
    // ASP.NET's validation ProblemDetails puts the actually-useful message in `errors`
    // (field -> messages), not `detail`/`title` - those are just the generic boilerplate.
    const fieldErrors = problem?.errors ? Object.values(problem.errors).flat() : [];
    const message =
      fieldErrors.length > 0
        ? fieldErrors.join(" ")
        : (problem?.detail ?? problem?.title ?? response.statusText ?? "Request failed");
    throw new ApiError(response.status, message, problem?.title);
  }

  return body as T;
}

export const api = {
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "POST", body: data !== undefined ? JSON.stringify(data) : undefined }),
};
