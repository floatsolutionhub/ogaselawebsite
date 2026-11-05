// Mirrors Ogasela.API's DTOs (same names/casing as OgaselaMobileClient/src/types/api.ts). Only the
// shapes this site renders.

export interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string[]>;
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
