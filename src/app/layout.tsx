import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";

import { FavouritesProvider } from "@/components/favourites/FavouritesProvider";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SupportButton } from "@/components/layout/SupportButton";
import { CookieConsent } from "@/components/site/CookieConsent";
import { LaunchProvider } from "@/components/site/LaunchProvider";
import { getLaunchConfig } from "@/config/launch";
import { LiveProvider } from "@/components/providers/LiveProvider";
import { LocationProvider } from "@/components/providers/LocationProvider";
import { SessionProvider, type Viewer } from "@/components/providers/SessionProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { env } from "@/config/env";
import { site } from "@/config/site";
import { safeHttpUrl } from "@/lib/format";
import { getShopLocation } from "@/lib/location.server";
import { getCurrentUser } from "@/lib/auth/session";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  // ogasela.com's existing title and description, kept for search rankings.
  title: {
    default: "Ogasela | Buy and sell anything, from anyone, nearby",
    template: "%s | Ogasela",
  },
  description:
    "Ogasela is a Nigerian marketplace for buying and selling anything, near you: verified sellers, in-app chat, ad plans that get you seen, and Office Pickup with inspection before you pay the seller.",
  applicationName: "Ogasela",
  openGraph: {
    title: "Ogasela | Buy and sell anything, from anyone, nearby",
    description: "Nigeria's marketplace for buying and selling anything, from anyone, near you.",
    type: "website",
    siteName: "Ogasela",
    locale: "en_NG",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0f5429",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [user, location] = await Promise.all([getCurrentUser(), getShopLocation()]);
  // Only what client components need - never the whole profile, never tokens.
  const viewer: Viewer | null = user && {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
    phone: user.phone,
    photoUrl: safeHttpUrl(user.profilePhotoUrl),
    sellerProfileId: user.sellerProfile?.id ?? null,
    businessName: user.sellerProfile?.businessName ?? null,
  };

  return (
    <html lang="en-NG" className={`${poppins.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-full bg-gold-400 px-4 py-2 font-semibold text-brand-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <ToastProvider>
          <SessionProvider viewer={viewer} idleMinutes={env.autoLogoutMinutes}>
            <LocationProvider initial={location}>
              <LiveProvider>
                <FavouritesProvider>
                  <LaunchProvider config={getLaunchConfig()}>
                  {/* Not in a Suspense boundary on purpose: the shell then waits for the page, so
                      notFound() and redirects send real 404/307 statuses instead of streamed fallbacks. */}
                  <SiteHeader />
                  <main id="main" className="flex-1">
                    {children}
                  </main>
                  <SiteFooter />
                  <MobileTabBar />
                  {viewer && <SupportButton phone={env.supportPhone} whatsappUrl={env.supportWhatsappUrl} />}
                  <CookieConsent />
                  </LaunchProvider>
                </FavouritesProvider>
              </LiveProvider>
            </LocationProvider>
          </SessionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
