import type { DisputeOutcome, DisputeReason, DisputeStatus, OfficePickupStatus } from "@/lib/api/types";

// Labels and badge colours shared by list and detail pages (same as the app's).

export const PICKUP_STATUS: Record<OfficePickupStatus, { label: string; className: string }> = {
  AwaitingPayment: { label: "Awaiting payment", className: "bg-canvas text-ink-500" },
  PaymentFailed: { label: "Payment failed", className: "bg-canvas text-ink-500" },
  PaymentCancelled: { label: "Cancelled", className: "bg-canvas text-ink-500" },
  PaymentConfirmed: { label: "Paid", className: "bg-gold-50 text-gold-800" },
  ItemReceived: { label: "At our office", className: "bg-brand-50 text-brand-700" },
  InspectionPassed: { label: "Inspected", className: "bg-brand-50 text-brand-700" },
  InspectionFailed: { label: "Failed inspection", className: "bg-danger/10 text-danger" },
  ReadyForCollection: { label: "Ready", className: "bg-brand-600 text-white" },
  OutForDelivery: { label: "On its way", className: "bg-brand-600 text-white" },
  Completed: { label: "Completed", className: "bg-brand-50 text-brand-700" },
  Refunded: { label: "Refunded", className: "bg-canvas text-ink-500" },
};

export const DISPUTE_STATUS: Record<DisputeStatus, { label: string; className: string }> = {
  Open: { label: "Open", className: "bg-danger/10 text-danger" },
  InReview: { label: "In review", className: "bg-gold-50 text-gold-800" },
  Resolved: { label: "Resolved", className: "bg-brand-50 text-brand-700" },
};

export const DISPUTE_REASON_LABELS: Record<DisputeReason, string> = {
  ItemNotAsDescribed: "Item not as described",
  NotDelivered: "Item not delivered",
  PaidNoResponse: "Paid, seller stopped responding",
  FakeOrCounterfeit: "Fake or counterfeit item",
  BuyerDidNotPay: "Buyer didn't pay",
  Other: "Something else",
};

export const BUYER_REASONS: DisputeReason[] = ["NotDelivered", "ItemNotAsDescribed", "PaidNoResponse", "FakeOrCounterfeit", "Other"];
export const SELLER_REASONS: DisputeReason[] = ["BuyerDidNotPay", "Other"];

/** The outcome from the reader's side - the API's is relative to who raised it. */
export function outcomeText(outcome: DisputeOutcome | null, myRole: "Raiser" | "Respondent"): string {
  switch (outcome) {
    case "InFavourOfRaiser":
      return myRole === "Raiser" ? "Resolved in your favour" : "Resolved in the other party's favour";
    case "InFavourOfRespondent":
      return myRole === "Respondent" ? "Resolved in your favour" : "Resolved in the other party's favour";
    case "MutualAgreement":
      return "Settled by mutual agreement";
    case "Dismissed":
      return "Dismissed";
    default:
      return "Resolved";
  }
}
