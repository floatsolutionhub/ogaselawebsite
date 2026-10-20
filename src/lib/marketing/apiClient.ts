// Drop-in for OgaselaWebsite's browser API client, used by the copied contact, waiting-list,
// testers and account-deletion forms. Same `api.post(path, body)` / `ApiError` shape, but the
// call goes through a Server Action (src/app/actions/marketing.ts) instead of the browser
// calling Ogasela.API directly - so this site still never talks to the API from the browser.
import { postMarketingForm } from "@/app/actions/marketing";

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

export const api = {
  post: async <T = void>(path: string, data?: unknown): Promise<T> => {
    const result = await postMarketingForm(path, data);
    if (!result.ok) throw new ApiError(result.status, result.message, result.code);
    return undefined as T;
  },
};
