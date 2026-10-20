// Store links and the donation page are set in .env, not here - see src/config/launch.ts.
export const site = {
  name: "Ogasela",
  tagline: "Nigeria's marketplace for anything, from anyone, nearby.",
  domain: "ogasela.com",
  /**
   * The company that owns Ogasela: the data controller named in the Privacy Policy, the
   * contracting party in the Terms, and the owner of the Ogasela trademark. Keep it matching the
   * CAC registration exactly, and add the RC number below.
   */
  legalName: "Float Solution Hub",
  rcNumber: "",
  supportEmail: "support@ogasela.com",
  privacyEmail: "privacy@ogasela.com",
  location: "Lagos, Nigeria",
  /**
   * Official accounts only - an icon is shown just for the ones filled in. Left empty because the
   * guessed /ogasela handles couldn't be confirmed as ours (facebook.com/ogasela belongs to
   * someone else), and a footer link to a stranger's profile is worse than no link.
   */
  social: {
    instagram: "",
    x: "",
    facebook: "",
    tiktok: "",
  },
};

export const primaryNavLinks = [
  { label: "Home", href: "/" },
  { label: "How it works", href: "/how-it-works" },
  { label: "About us", href: "/about" },
  { label: "Trust & safety", href: "/trust-and-safety" },
  { label: "Contact us", href: "/contact" },
];

export const footerLinks = {
  company: [
    { label: "About us", href: "/about" },
    { label: "How it works", href: "/how-it-works" },
    { label: "Trust & safety", href: "/trust-and-safety" },
    { label: "Careers", href: "/careers" },
    { label: "Contact us", href: "/contact" },
    { label: "Locate us", href: "/locate-us" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms-and-conditions" },
    { label: "Account / Data Deletion", href: "/account-deletion" },
  ],
};
