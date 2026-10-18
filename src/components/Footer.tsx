import Link from "next/link";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { footerLinks, site } from "@/lib/site";

const socialLinks = [
  { label: "Instagram", short: "IG", href: site.social.instagram },
  { label: "X (Twitter)", short: "X", href: site.social.x },
  { label: "Facebook", short: "FB", href: site.social.facebook },
  { label: "TikTok", short: "TT", href: site.social.tiktok },
].filter((social) => social.href);

export function Footer() {
  return (
    <footer className="border-t border-ink-900/5 bg-brand-900 text-brand-50">
      <Container className="grid gap-10 py-16 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2">
            <Logo size={36} />
            <span className="text-lg font-bold text-white">Ogasela</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-brand-200">
            {site.tagline}
          </p>
          {socialLinks.length > 0 && (
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <SocialIcon key={social.label} href={social.href} label={social.label}>
                  {social.short}
                </SocialIcon>
              ))}
            </div>
          )}
        </div>

        <FooterColumn title="Company" links={footerLinks.company} />
        <FooterColumn title="Legal" links={footerLinks.legal} />

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-300">
            Get in touch
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-brand-100">
            <li>
              <a href={`mailto:${site.supportEmail}`} className="hover:text-white">
                {site.supportEmail}
              </a>
            </li>
            <li>{site.location}</li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-3 py-6 text-xs text-brand-300 md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {site.legalName}, {site.location}. All rights reserved.
            Ogasela is a trademark of {site.legalName}.
          </p>
          <p>Made for the everyday Nigerian hustle.</p>
        </Container>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-300">{title}</h3>
      <ul className="mt-4 space-y-3 text-sm text-brand-100">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-white transition-colors hover:bg-white/20"
    >
      {children}
    </a>
  );
}
