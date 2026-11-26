import { Suspense } from "react";
import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CinematicPreloader } from "@/components/animations/CinematicPreloader";
import { getSiteSettings } from "@/lib/firestore";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://mjphotography.art";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MJ PHOTOGRAPHY — Every Frame Tells A Story",
    template: "%s | MJ PHOTOGRAPHY",
  },
  description:
    "Luxury editorial photography studio and interactive 3D digital art gallery. Capturing weddings, portraits, fashion, travel, wildlife, and fine art commissions worldwide.",
  openGraph: {
    type: "website",
    siteName: "MJ PHOTOGRAPHY",
    title: "MJ PHOTOGRAPHY — Every Frame Tells A Story",
    description:
      "Capturing moments. Creating memories. Preserving emotions.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MJ PHOTOGRAPHY — Every Frame Tells A Story",
    description:
      "Capturing moments. Creating memories. Preserving emotions.",
  },
};

async function FooterWithSettings() {
  const settings = await getSiteSettings();
  return <SiteFooter settings={settings} />;
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jakarta.variable} ${jetbrains.variable} dark`}
    >
      <body className="min-h-[100dvh] flex flex-col bg-[#080808] text-white antialiased">
        <AppProviders>
          <a href="#main-content" className="skip-link visually-hidden">
            Skip to main content
          </a>
          <CinematicPreloader />
          <div className="film-grain" aria-hidden="true" />
          <Suspense fallback={null}>
            <SiteHeader brandName="MJ PHOTOGRAPHY" />
          </Suspense>
          <main id="main-content" tabIndex={-1} className="flex-1">
            {children}
          </main>
          <Suspense
            fallback={
              <footer className="border-t border-white/10 bg-[#080808] py-12 text-center text-xs text-[#A0A0A0]">
                &copy; 2026 MJ PHOTOGRAPHY. All rights reserved.
              </footer>
            }
          >
            <FooterWithSettings />
          </Suspense>
        </AppProviders>
      </body>
    </html>
  );
}
