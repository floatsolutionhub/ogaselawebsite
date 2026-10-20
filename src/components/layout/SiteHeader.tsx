import Link from "next/link";
import { Heart, Plus, Search } from "lucide-react";

import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { buttonClass } from "@/components/ui/styles";
import { getCurrentUser } from "@/lib/auth/session";
import { safeHttpUrl } from "@/lib/format";
import { HeaderSearch } from "./HeaderSearch";
import { LiveLinks } from "./LiveLinks";
import { LocationPill } from "./LocationPill";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? user?.sellerProfile?.businessName ?? "Account";
  const photo = safeHttpUrl(user?.profilePhotoUrl);

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-brand-700 text-white">
        <Container className="flex h-16 items-center gap-3 sm:h-[72px] sm:gap-5">
          <Logo light />
          <LocationPill className="hidden lg:inline-flex" />
          <HeaderSearch className="hidden flex-1 md:flex" />

          <nav aria-label="Main" className="ml-auto flex items-center gap-1 sm:gap-1.5">
            <Link
              href="/search"
              aria-label="Search"
              className="grid size-10 place-items-center rounded-full text-white/90 hover:bg-white/10 md:hidden"
            >
              <Search aria-hidden className="size-5" />
            </Link>
            {user && <LiveLinks />}
            <Link
              href="/favourites"
              aria-label="Saved items"
              className="hidden size-10 place-items-center rounded-full text-white/90 hover:bg-white/10 sm:grid"
            >
              <Heart aria-hidden className="size-5" />
            </Link>
            {user ? (
              <Link
                href="/account"
                className="hidden h-10 items-center gap-2 rounded-full px-2 pr-3 text-sm font-medium text-white/90 hover:bg-white/10 sm:inline-flex"
              >
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt="" referrerPolicy="no-referrer" className="size-7 rounded-full object-cover" />
                ) : (
                  <span className="grid size-7 place-items-center rounded-full bg-gold-400 text-xs font-bold text-brand-900">
                    {firstName.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="max-w-28 truncate">{firstName}</span>
              </Link>
            ) : (
              <Link
                href="/sign-in"
                className="hidden h-10 items-center rounded-full px-4 text-sm font-medium text-white/90 hover:bg-white/10 sm:inline-flex"
              >
                Sign in
              </Link>
            )}
            <Link href="/sell" className={buttonClass("gold", "sm", "hidden sm:inline-flex")}>
              <Plus aria-hidden className="size-4" strokeWidth={2.5} />
              Sell
            </Link>
          </nav>
        </Container>
      </div>
      {/* The market-stall canopy. */}
      <div aria-hidden className="awning h-4 drop-shadow-sm" />
    </header>
  );
}
