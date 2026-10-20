/**
 * What buyers and sellers say about Ogasela, for the homepage.
 *
 * Only publish real testimonials, from real users who agreed to be quoted - invented reviews
 * mislead buyers and can break consumer-protection rules. Entries marked `sample: true` are
 * stand-ins so the section can be seen while developing: they never appear in a production
 * build, and the section hides itself until at least one real entry is added here.
 */
export type Testimonial = {
  quote: string;
  name: string;
  /** e.g. "Seller, Ikeja" or "Buyer, Wuse 2". */
  role: string;
  rating: 1 | 2 | 3 | 4 | 5;
  sample?: boolean;
};

export const testimonials: Testimonial[] = [
  {
    quote: "I posted my old laptop in the morning and a buyer around me called before lunch. Smooth from start to finish.",
    name: "Sample seller",
    role: "Seller, Lagos",
    rating: 5,
    sample: true,
  },
  {
    quote: "Office pickup gave me peace of mind. They checked the phone before I paid, so I knew exactly what I was getting.",
    name: "Sample buyer",
    role: "Buyer, Abuja",
    rating: 5,
    sample: true,
  },
  {
    quote: "The verified badge brings me serious buyers. Fewer time wasters, more sales for my shop.",
    name: "Sample shop owner",
    role: "Verified business, Ibadan",
    rating: 4,
    sample: true,
  },
];

/** What the homepage may show: real entries only, except while developing. */
export function publishableTestimonials(): Testimonial[] {
  return process.env.NODE_ENV === "production" ? testimonials.filter((t) => !t.sample) : testimonials;
}
