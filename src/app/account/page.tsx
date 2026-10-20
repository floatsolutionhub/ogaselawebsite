import type { Metadata } from "next";
import Link from "next/link";
import {
  ChartColumn,
  ChevronRight,
  CircleHelp,
  LogOut,
  Mail,
  Megaphone,
  PackageCheck,
  Phone,
  Scale,
  Settings,
  Shield,
  Trash2,
  UserRound,
  Bell,
} from "lucide-react";

import { signOut } from "@/app/actions/auth";
import { StatusPill } from "@/components/account/StatusPill";
import { Container } from "@/components/Container";
import { cardClass } from "@/components/ui/styles";
import { env } from "@/config/env";
import { site } from "@/config/site";
import { settle } from "@/lib/api/client";
import { getVerificationOverview } from "@/lib/api/services/me";
import { requireUser } from "@/lib/auth/session";
import { memberSince, safeHttpUrl } from "@/lib/format";

export const metadata: Metadata = { title: "Profile", robots: { index: false } };

const QUICK_LINKS = [
  { href: "/my-ads", icon: Megaphone, label: "My ads" },
  { href: "/analytics", icon: ChartColumn, label: "Analytics" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
];

const MENU = [
  { href: "/office-pickups", icon: PackageCheck, label: "Office pickups" },
  { href: "/disputes", icon: Scale, label: "Disputes" },
  { href: "/account/settings", icon: Settings, label: "Settings" },
  { href: site.links.privacy, icon: Shield, label: "Privacy policy" },
  { href: site.links.terms, icon: Shield, label: "Terms & Conditions" },
  { href: site.links.contact, icon: CircleHelp, label: "Help & support" },
];

export default async function AccountPage() {
  const user = await requireUser("/account");
  const verification = await settle(getVerificationOverview());
  const photo = safeHttpUrl(user.profilePhotoUrl);
  const displayName = user.name ?? user.sellerProfile?.businessName ?? "Ogasela user";

  return (
    <Container className="max-w-3xl py-8 sm:py-12">
      <section className="ankara relative overflow-hidden rounded-[2rem] text-white">
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-brand-900 via-brand-900/90 to-brand-900/60" />
        <div className="relative flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" referrerPolicy="no-referrer" className="size-24 rounded-full object-cover ring-4 ring-white/20" />
          ) : (
            <span className="grid size-24 place-items-center rounded-full bg-gold-400 text-brand-900 ring-4 ring-white/15">
              <UserRound aria-hidden className="size-10" strokeWidth={1.5} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold">{displayName}</h1>
            <div className="mt-1 space-y-0.5 text-sm text-brand-100">
              {user.email && (
                <p className="flex items-center justify-center gap-1.5 sm:justify-start">
                  <Mail aria-hidden className="size-4" /> {user.email}
                </p>
              )}
              {user.phone && (
                <p className="flex items-center justify-center gap-1.5 sm:justify-start">
                  <Phone aria-hidden className="size-4" /> {user.phone}
                </p>
              )}
              <p className="text-brand-200">On Ogasela since {memberSince(user.createdAt)}</p>
            </div>
            {verification && (
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                <StatusPill label="Account" status={verification.personal.status} href="/account/personal" />
                <StatusPill
                  label="Business"
                  status={verification.business?.status ?? null}
                  href={verification.business ? "/account/business" : undefined}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <ul className="mt-6 grid grid-cols-3 gap-3">
        {QUICK_LINKS.map(({ href, icon: Icon, label }) => (
          <li key={href}>
            <Link href={href} className={`${cardClass} flex flex-col items-center gap-2 p-4 text-center text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-lift`}>
              <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <Icon aria-hidden className="size-5" />
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <ul className={`${cardClass} mt-6 divide-y divide-canvas-dark/60 overflow-hidden`}>
        {MENU.map(({ href, icon: Icon, label }) => (
          <li key={label}>
            <Link href={href} className="flex items-center gap-3 px-5 py-4 transition hover:bg-brand-50/50">
              <Icon aria-hidden className="size-5 text-brand-600" />
              <span className="flex-1 font-medium">{label}</span>
              <ChevronRight aria-hidden className="size-4 text-ink-300" />
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-center text-xs text-ink-500">
        You&apos;ll be signed out automatically after {env.autoLogoutMinutes} minutes of inactivity.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link href="/account/delete" className="flex items-center justify-center gap-2 rounded-full border border-canvas-dark bg-white py-3 font-semibold text-ink-700 hover:bg-canvas">
          <Trash2 aria-hidden className="size-4" /> Delete account
        </Link>
        <form action={signOut}>
          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-full border border-danger/25 bg-white py-3 font-semibold text-danger hover:bg-danger/5">
            <LogOut aria-hidden className="size-4" /> Log out
          </button>
        </form>
      </div>
    </Container>
  );
}
