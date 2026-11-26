import Link from "next/link";
import { Aperture, ArrowUpRight } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "@/components/ui/SocialIcons";
import type { SiteSettings } from "@/types";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const currentYear = 2026;

  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#080808] text-white">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 pt-16 pb-16 lg:pt-20 lg:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 pb-14 border-b border-white/10">
          <div className="md:col-span-5 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3 text-white">
              <Aperture aria-hidden="true" className="h-6 w-6 text-[#C6A46A]" />
              <span className="font-editorial text-2xl tracking-[0.22em] uppercase">
                {settings.brandName}
              </span>
            </Link>
            <p className="font-editorial text-xl text-[#C6A46A] italic">
              &ldquo;{settings.tagline}&rdquo;
            </p>
            <p className="text-sm text-[#A0A0A0] leading-relaxed max-w-md">
              {settings.supportingText} Editorial commissions across weddings,
              portraiture, fashion, architecture, and wilderness visual essays.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs tracking-[0.15em] uppercase text-white/80 hover:border-[#C6A46A] hover:text-[#C6A46A] transition-colors min-h-[40px]"
                >
                  <InstagramIcon className="h-4 w-4" />
                  <span>Instagram</span>
                </a>
              )}
              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs tracking-[0.15em] uppercase text-white/80 hover:border-[#C6A46A] hover:text-[#C6A46A] transition-colors min-h-[40px]"
                >
                  <FacebookIcon className="h-4 w-4" />
                  <span>Facebook</span>
                </a>
              )}
            </div>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h2 className="text-xs tracking-[0.2em] uppercase text-[#C6A46A]">
              Navigation
            </h2>
            <ul className="space-y-2.5 text-sm text-[#A0A0A0] list-none p-0 m-0">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About the Studio
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-white transition-colors">
                  Photography Gallery
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/exhibition" className="hover:text-white transition-colors">
                  3D Virtual Exhibition
                </Link>
              </li>
              <li>
                <Link href="/stories" className="hover:text-white transition-colors">
                  Visual Stories
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Photography Services
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact &amp; Booking
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-4">
            <h2 className="text-xs tracking-[0.2em] uppercase text-[#C6A46A]">
              Studio Desk
            </h2>
            <div className="space-y-2 text-sm text-[#A0A0A0]">
              <p className="text-white">{settings.studioAddress}</p>
              <p>
                <a
                  href={`mailto:${settings.email}`}
                  className="hover:text-[#C6A46A] transition-colors"
                >
                  {settings.email}
                </a>
              </p>
              <p>
                <a
                  href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                  className="hover:text-[#C6A46A] transition-colors"
                >
                  {settings.phone}
                </a>
              </p>
            </div>
            <div className="pt-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-xs tracking-[0.18em] uppercase text-[#C6A46A] hover:text-white transition-colors"
              >
                <span>Request Private Consultation</span>
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#A0A0A0]">
          <p>
            &copy; {currentYear} {settings.brandName}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link
              href="/admin"
              className="hover:text-[#C6A46A] transition-colors"
            >
              Studio Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
