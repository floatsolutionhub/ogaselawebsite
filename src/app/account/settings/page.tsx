import type { Metadata } from "next";
import Link from "next/link";
import { Ban, Bell, Briefcase, ChevronRight, KeyRound, Mail, Phone, User } from "lucide-react";

import { ScreenHeader } from "@/components/account/ScreenHeader";
import { Container } from "@/components/Container";
import { cardClass } from "@/components/ui/styles";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Settings", robots: { index: false } };

const SECTIONS = [
  {
    title: "Account",
    items: [
      { href: "/account/personal", icon: User, label: "Personal info", description: "Your name, photo and ID documents" },
      { href: "/account/business", icon: Briefcase, label: "Business info", description: "Business details and documents", sellerOnly: true },
    ],
  },
  {
    title: "Contact",
    items: [
      { href: "/account/contact?type=phone", icon: Phone, label: "Change phone number", description: "Used for sign-in codes. Needs approval" },
      { href: "/account/contact?type=email", icon: Mail, label: "Change email", description: "Used for receipts and reset codes. Needs approval" },
    ],
  },
  {
    title: "Security & alerts",
    items: [
      { href: "/account/password", icon: KeyRound, label: "Update password", description: "Change your sign-in password" },
      { href: "/account/alerts", icon: Bell, label: "Manage notifications", description: "Choose what we notify you about" },
    ],
  },
  {
    title: "Privacy",
    items: [{ href: "/account/blocked", icon: Ban, label: "Blocked users", description: "People who can't message you" }],
  },
];

export default async function SettingsPage() {
  const user = await requireUser("/account/settings");
  const isSeller = user.role === "Seller";
  return (
    <Container className="max-w-2xl py-8 sm:py-12">
      <ScreenHeader title="Settings" back="/account" backLabel="Profile" />
      <div className="space-y-6">
        {SECTIONS.map((section) => {
          const items = section.items.filter((item) => !("sellerOnly" in item && item.sellerOnly) || isSeller);
          if (items.length === 0) return null;
          return (
            <section key={section.title}>
              <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-ink-500">{section.title}</h2>
              <ul className={`${cardClass} divide-y divide-canvas-dark/60 overflow-hidden`}>
                {items.map(({ href, icon: Icon, label, description }) => (
                  <li key={href}>
                    <Link href={href} className="flex items-center gap-3 px-5 py-4 transition hover:bg-brand-50/50">
                      <Icon aria-hidden className="size-5 text-brand-600" />
                      <span className="flex-1">
                        <span className="block font-medium">{label}</span>
                        <span className="text-sm text-ink-500">{description}</span>
                      </span>
                      <ChevronRight aria-hidden className="size-4 text-ink-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </Container>
  );
}
