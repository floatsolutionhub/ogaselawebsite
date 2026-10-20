// Mirrors Ogasela.API's DTOs (same names/casing as OgaselaMobileClient/src/types/api.ts). Only the
// shapes the web client uses so far - copy more across from the mobile client as features land.

export type UserRole =
  | "Buyer"
  | "Seller"
  | "SupportAgent"
  | "Moderator"
  | "FinanceAdmin"
  | "SuperAdmin"
  | "Staff";

export interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface AuthTokenResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export interface RegisterResponse {
  userId: string;
  role: UserRole;
}

export interface LoginOtpSentResponse {
  maskedEmail: string;
  maskedPhone: string;
  verificationRequired: boolean;
  channel: "Email" | "Phone";
}

export interface SellerProfileSummary {
  id: string;
  businessName: string;
  verificationStatus: "NotStarted" | "Pending" | "Verified" | "Failed" | "ManualReview";
  verifiedAt: string | null;
  storeAddress?: string | null;
  businessVerifiedAt?: string | null;
}

export interface CurrentUser {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  role: UserRole;
  createdAt: string;
  sellerProfile: SellerProfileSummary | null;
  profilePhotoUrl?: string | null;
}

export type ListingCondition = "New" | "Used";
export type ListingStatus =
  | "Draft"
  | "Active"
  | "ExpiringSoon"
  | "Expired"
  | "Paused"
  | "Sold"
  | "PendingReview"
  /** Removed by its seller - the API never returns these, but the enum has it. */
  | "Deleted";

export interface Listing {
  id: string;
  sellerId: string;
  categoryId: string;
  promotionPlanId: string | null;
  title: string;
  description: string;
  price: number | null;
  condition: ListingCondition;
  status: ListingStatus;
  mediaUrls: string[];
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Why a moderator rejected the last submission (the ad is back in Draft); null otherwise. */
  reviewNote?: string | null;
  hasOriginalReceipt?: boolean | null;
  tikTokUrl?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  youTubeUrl?: string | null;
  officePickupAvailable?: boolean;
}

/** GET /listings/{id}. seller.phone is null unless the caller is signed in. */
export interface ListingDetail extends Listing {
  categoryName: string | null;
  parentCategoryId: string | null;
  promotionPlanName: string | null;
  seller: {
    sellerProfileId: string;
    userId: string;
    businessName: string;
    name: string | null;
    phone: string | null;
    storeAddress: string | null;
    verificationStatus: string;
    memberSince: string;
    isBusinessVerified?: boolean;
    isBlockedByMe?: boolean;
  };
}

export type SearchSort = "relevance" | "newest" | "price_asc" | "price_desc" | "distance";

export interface SearchResultItem {
  id: string;
  sellerId: string;
  categoryId: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  price: number | null;
  condition: ListingCondition;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  publishedAt: string | null;
  createdAt: string;
  planTier: string;
  distanceKm: number | null;
  score: number;
}

export interface Category {
  id: string;
  name: string;
  parentCategoryId: string | null;
  isFreeEligible: boolean;
  attributeSchemaVersion: number;
  imageUrl: string | null;
}

export interface SellerProfile {
  sellerProfileId: string;
  businessName: string;
  name: string | null;
  storeAddress: string | null;
  verificationStatus: string;
  memberSince: string;
  activeAdCount: number;
  averageRating: number;
  reviewCount: number;
  isBusinessVerified?: boolean;
  userId: string;
  isBlockedByMe?: boolean;
}

export interface ReviewListItem {
  id: string;
  reviewerId: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewerName: string | null;
}

export interface PagedReviews extends PagedResult<ReviewListItem> {
  averageRating: number;
}

// Messaging - ConversationsController.cs, UsersController.cs

export interface Conversation {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  otherParticipantId: string;
  createdAt: string;
  lastMessageAt: string | null;
  isBlockedByMe: boolean;
  /** The other person deleted their account - the chat stays readable, but closed for good. */
  isOtherParticipantDeleted: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  imageUrl: string | null;
  sentAt: string;
  readAt: string | null;
}

export interface BlockedUser {
  userId: string;
  displayName: string | null;
  blockedAt: string;
}

// Inbox - InboxController.cs

export interface InboxNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  listingId: string | null;
  conversationId: string | null;
  disputeId?: string | null;
  officePickupId?: string | null;
  count: number;
  isRead: boolean;
  updatedAt: string;
}

export interface InboxPage extends PagedResult<InboxNotification> {
  unreadCount: number;
}

export type NotificationChannel = "Push" | "Sms" | "Email" | "WhatsApp";

export interface NotificationPreference {
  channel: NotificationChannel;
  category: string;
  enabled: boolean;
}

// Promotions & checkout

export interface PromotionPlan {
  id: string;
  name: string;
  description: string | null;
  features: string[];
  durationDays: number;
  photoLimit: number;
  videoAllowed: boolean;
  boostWeight: number;
  /** Kobo. 0 is free. */
  price: number;
  aiToolTier: "Basic" | "Standard" | "Full";
  adPlatformPushAllowed: boolean;
  bundledAdCreditKobo: number;
  isActive: boolean;
}

export type ListingCheckoutOutcome = "Submitted" | "PaymentRequired" | "PaymentPending" | "PaymentFailed" | "PaymentCancelled";

export interface ListingCheckout {
  outcome: ListingCheckoutOutcome;
  listing: Listing;
  paymentReference: string | null;
  redirectUrl: string | null;
}

export interface ListingInput {
  title: string;
  description: string;
  categoryId: string;
  price: number | null;
  condition: ListingCondition;
  mediaUrls: string[];
  promotionPlanId: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  hasOriginalReceipt: boolean | null;
  tikTokUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  youTubeUrl: string | null;
}

// AI - AiController.cs

export interface ListingCopySuggestion {
  title: string;
  description: string;
}

/** Despite the names these are in naira - see OgaselaMobileClient/src/services/ai.ts. */
export interface PriceSuggestion {
  minKobo: number;
  suggestedKobo: number;
  maxKobo: number;
  comparableCount: number;
}

// Me - MeController.cs

export type ProfileChangeType = "Phone" | "Email" | "BusinessInfo";
export type ProfileChangeStatus = "PendingReview" | "Approved" | "Rejected" | "Cancelled";

export interface ProfileChange {
  id: string;
  type: ProfileChangeType;
  newValue: string | null;
  businessName: string | null;
  storeAddress: string | null;
  status: ProfileChangeStatus;
  reviewNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export type UserDocumentType = "IdCard" | "UtilityBill" | "BusinessRegistration" | "OfficeUtilityBill";
export type IdDocumentType = "NationalIdCard" | "NinSlip" | "VotersCard" | "DriversLicence" | "InternationalPassport";
export type UserDocumentStatus = "PendingReview" | "Approved" | "Rejected";

export interface UserDocument {
  id: string;
  type: UserDocumentType;
  idType: IdDocumentType | null;
  idNumber: string | null;
  fileName: string;
  contentType: string;
  status: UserDocumentStatus;
  fileUrl: string;
  createdAt: string;
  reviewNote?: string | null;
}

export type VerificationTrackStatus = "NotStarted" | "InProgress" | "PendingReview" | "Verified";
export type VerificationItemKey = "Selfie" | "IdCard" | "UtilityBill" | "BusinessRegistration" | "OfficeUtilityBill";
export type VerificationItemState = "Missing" | "Submitted" | "Approved" | "Rejected";

export interface VerificationTrack {
  status: VerificationTrackStatus;
  verifiedAt: string | null;
  items: { key: VerificationItemKey; state: VerificationItemState; note?: string | null }[];
}

export interface VerificationOverview {
  personal: VerificationTrack;
  business: VerificationTrack | null;
}

// Analytics - AnalyticsController.cs

export type AnalyticsDays = 7 | 30 | 90;

export interface MetricComparison {
  current: number;
  previous: number;
}

export interface SellerAnalytics {
  days: number;
  from: string;
  to: string;
  profileVisits: MetricComparison;
  impressions: MetricComparison;
  views: MetricComparison;
  callClicks: MetricComparison;
  messageStarts: MetricComparison;
  saves: MetricComparison;
}

export interface ExternalPlatformEngagement {
  platform: "Facebook" | "TikTok";
  promoted: boolean;
  campaignStatus: string | null;
  impressions: number;
  clicks: number;
  spendKobo: number;
  lastSyncedAt: string | null;
}

export interface ListingAnalytics {
  listingId: string;
  title: string;
  days: number;
  ogasela: {
    impressions: MetricComparison;
    views: MetricComparison;
    callClicks: MetricComparison;
    messageStarts: MetricComparison;
    saves: MetricComparison;
  };
  platforms: ExternalPlatformEngagement[];
}

// Disputes - DisputesController.cs

export type DisputeReason = "ItemNotAsDescribed" | "NotDelivered" | "PaidNoResponse" | "FakeOrCounterfeit" | "BuyerDidNotPay" | "Other";
export type DisputeStatus = "Open" | "InReview" | "Resolved";
export type DisputeOutcome = "InFavourOfRaiser" | "InFavourOfRespondent" | "MutualAgreement" | "Dismissed";

export interface DisputeSummary {
  id: string;
  reference: string;
  listingId: string;
  listingTitle: string;
  listingThumbnailUrl: string | null;
  myRole: "Raiser" | "Respondent";
  otherPartyName: string;
  reason: DisputeReason;
  status: DisputeStatus;
  outcome: DisputeOutcome | null;
  createdAt: string;
  updatedAt: string;
}

export interface DisputeEvidence {
  url: string;
  isPdf: boolean;
}

export interface DisputeThreadMessage {
  id: string;
  authorRole: "Raiser" | "Respondent" | "Staff";
  authorName: string;
  body: string;
  attachment: DisputeEvidence | null;
  createdAt: string;
}

export interface DisputeDetail {
  summary: DisputeSummary;
  description: string;
  evidence: DisputeEvidence[];
  resolutionNote: string | null;
  resolvedAt: string | null;
  messages: DisputeThreadMessage[];
}

// Office pickups - OfficePickupsController.cs (every amount in kobo)

export type OfficePickupStatus =
  | "AwaitingPayment"
  | "PaymentFailed"
  | "PaymentCancelled"
  | "PaymentConfirmed"
  | "ItemReceived"
  | "InspectionPassed"
  | "InspectionFailed"
  | "ReadyForCollection"
  | "OutForDelivery"
  | "Completed"
  | "Refunded";

export interface OfficeBranch {
  id: string;
  name: string;
  address: string;
  state: string;
  city: string | null;
  phone: string | null;
  openingHours: string | null;
  latitude: number;
  longitude: number;
  distanceKm: number | null;
}

export interface OfficePickupQuote {
  available: boolean;
  itemPriceKobo: number;
  serviceFeeKobo: number;
  totalKobo: number;
  cancellationFeeKobo: number;
  serviceFeePercent: number;
  cancellationFeePercent: number;
  isOwnListing: boolean;
}

export interface OfficePickupSummary {
  id: string;
  reference: string;
  listingId: string;
  listingTitle: string;
  listingThumbnailUrl: string | null;
  myRole: "Buyer" | "Seller";
  status: OfficePickupStatus;
  statusLabel: string;
  totalKobo: number;
  branchName: string;
  cancellationRequested: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OfficePickupDetail {
  summary: OfficePickupSummary;
  itemPriceKobo: number;
  serviceFeeKobo: number;
  paidAt: string | null;
  branch: OfficeBranch;
  fulfilment: "BranchCollection" | "HomeDelivery" | null;
  deliveryAddress: string | null;
  cancellationRequestedAt: string | null;
  cancellationReason: string | null;
  cancellationFeeKobo: number | null;
  refundedKobo: number | null;
  refundedAt: string | null;
  completedAt: string | null;
  activities: { status: OfficePickupStatus; title: string; note: string | null; createdAt: string }[];
}

export interface OfficePickupCheckout {
  request: OfficePickupSummary;
  paymentReference: string;
  redirectUrl: string;
}

// Geo & announcements

export interface NigeriaState {
  id: string;
  name: string;
  code: string;
}

export interface NigeriaCity {
  id: string;
  stateId: string;
  name: string;
  /** Null until staff set it in the Control Portal. */
  latitude: number | null;
  longitude: number | null;
}

export interface NearestCity {
  state: NigeriaState;
  city: NigeriaCity;
  distanceKm: number;
}

export interface Announcement {
  id: string;
  title: string;
  caption: string;
  image: string;
  cta: { label: string; url: string } | null;
  createdAt: string;
}

/** TestimonialsController GET /testimonials - published only, newest first. */
export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  /** e.g. "Seller, Ikeja" or "Buyer, Wuse 2". */
  role: string;
  /** 1 to 5. */
  rating: number;
}

export interface SocialLoginResponse extends AuthTokenResponse {
  isNewUser: boolean;
}
