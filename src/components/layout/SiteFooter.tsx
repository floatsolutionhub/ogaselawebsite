import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";

import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { env } from "@/config/env";
import { site } from "@/config/site";
import { StoreBadges } from "@/components/site/StoreBadges";
import { footerLinks } from "@/lib/marketing/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 pb-20 sm:pb-0">
      <div aria-hidden className="ankara h-10" />
      <div className="bg-brand-900 text-brand-100">
        <Container className="grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div className="space-y-4">
            <Logo light />
            <p className="max-w-xs text-sm leading-6 text-brand-200">{site.tagline}</p>
          </div>

          <FooterColumn title="Market">
            <FooterLink href="/">Today&apos;s market</FooterLink>
            <FooterLink href="/search">Browse all ads</FooterLink>
            <FooterLink href="/sell">Sell on Ogasela</FooterLink>
            <FooterLink href="/favourites">Saved items</FooterLink>
          </FooterColumn>

          <FooterColumn title="Company">
            {footerLinks.company.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-300">Get help</h2>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href={`mailto:${site.supportEmail}`} className="inline-flex items-center gap-2 hover:text-white">
                  <Mail aria-hidden className="size-4" /> {site.supportEmail}
                </a>
              </li>
              {env.supportPhone && (
                <li>
                  <a href={`tel:${env.supportPhone}`} className="inline-flex items-center gap-2 hover:text-white">
                    <Phone aria-hidden className="size-4" /> {env.supportPhone}
                  </a>
                </li>
              )}
              {env.supportWhatsappUrl && (
                <li>
                  <a
                    href={env.supportWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:text-white"
                  >
                    <MessageCircle aria-hidden className="size-4" /> Chat on WhatsApp
                  </a>
                </li>
              )}
            </ul>
            <StoreBadges />
          </div>
        </Container>
        <Container className="flex flex-wrap gap-x-6 gap-y-2 pb-8 text-sm">
          {footerLinks.legal.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-white">
              {link.label}
            </Link>
          ))}
        </Container>
        <div className="border-t border-white/10">
          <Container className="flex flex-col gap-2 py-6 text-xs text-brand-300 sm:flex-row sm:justify-between">
            <p>© {year} Ogasela. Buy and sell safely: meet in public and inspect before you pay.</p>
            <p>Made for Nigeria&apos;s market squares.</p>
          </Container>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-300">{title}</h2>
      <ul className="space-y-2.5 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({ href, external, children }: { href: string; external?: boolean; children: React.ReactNode }) {
  return (
    <li>
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-white">
          {children}
        </a>
      ) : (
        <Link href={href} className="hover:text-white">
          {children}
        </Link>
      )}
    </li>
  );
}
