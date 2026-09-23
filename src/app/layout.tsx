import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Ogasela — Buy and sell anything, from anyone, nearby",
    template: "%s — Ogasela",
  },
  description:
    "Ogasela is Nigeria's marketplace for buying and selling anything, from anyone, near you. List an ad in minutes and reach real buyers in your city.",
  metadataBase: new URL("https://ogasela.com"),
  openGraph: {
    title: "Ogasela — Buy and sell anything, from anyone, nearby",
    description:
      "Nigeria's marketplace for buying and selling anything, from anyone, near you.",
    siteName: "Ogasela",
    locale: "en_NG",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
