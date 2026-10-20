export const site = {
  name: "Ogasela",
  tagline: "Nigeria's market square for anything, from anyone, nearby.",
  url: "https://ogasela.com",
  supportEmail: "support@ogasela.com",
  /** Pages of this site (merged in from OgaselaWebsite) - same paths the mobile app links to. */
  links: {
    terms: "/terms-and-conditions",
    privacy: "/privacy-policy",
    contact: "/contact",
    trust: "/trust-and-safety",
    about: "/about",
    howItWorks: "/how-it-works",
  },
} as const;

/** The 36 states and the FCT - used for location filters. */
export const NIGERIAN_STATES = [
  "Abia", "Abuja (FCT)", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna",
  "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
] as const;
