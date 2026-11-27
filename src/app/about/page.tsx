import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Aperture, Film, Compass } from "lucide-react";
import { getCachedSiteSettings } from "@/lib/portfolio-cache";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

export const metadata: Metadata = {
  title: "About the Studio",
  description:
    "Behind every lens, there is a story. Discover the artistic philosophy, medium-format craft, and creative approach of MJ PHOTOGRAPHY.",
};

async function AboutContent() {
  const settings = await getCachedSiteSettings();

  return (
    <div className="pt-32 pb-24 bg-[#080808]">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 space-y-20">
        <ScrollReveal className="max-w-4xl space-y-5">
          <p className="font-mono text-xs tracking-[0.28em] uppercase text-[#C6A46A]">
            The Atelier &amp; Philosophy
          </p>
          <h1 className="font-editorial text-5xl sm:text-6xl lg:text-7xl font-normal text-white leading-[1.04]">
            {settings.aboutHeadline}
          </h1>
          <p className="text-lg sm:text-xl text-[#A0A0A0] leading-relaxed max-w-3xl">
            {settings.supportingText}
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
              {settings.aboutImageUrl ? (
                <Image
                  src={settings.aboutImageUrl}
                  alt="MJ Photography principal portrait"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[radial-gradient(circle_at_center,rgba(198,164,106,0.12),transparent_60%),linear-gradient(180deg,#121212_0%,#090909_100%)]">
                  <div className="h-20 w-20 rounded-full border border-[#C6A46A]/40 flex items-center justify-center mb-6">
                    <Aperture aria-hidden="true" className="h-9 w-9 text-[#C6A46A]" />
                  </div>
                  <p className="font-editorial text-2xl text-white">
                    Studio Portrait Slot
                  </p>
                  <p className="mt-2 text-xs text-[#A0A0A0] max-w-xs">
                    Upload your own photographer portrait inside Studio Admin
                    Settings.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-5 prose-editorial text-[#CCCCCC] text-base sm:text-lg leading-relaxed">
              <p>{settings.aboutBio}</p>
              <p>
                Whether standing inside a thirteenth-century Italian palazzo or
                waiting out sub-polar dusk below Patagonian granite spires, our
                creative principle remains unchanged: light is never forced—it is
                observed, anticipated, and honored in quiet frames.
              </p>
              <p>
                Every master photograph is archived at native full resolution,
                preserving subtle shadow grain and micro-contrast for large-format
                museum prints as well as digital exhibition.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-white/10">
              <div className="rounded-xl border border-white/10 bg-[#111111] p-6 space-y-3">
                <Aperture aria-hidden="true" className="h-5 w-5 text-[#C6A46A]" />
                <h2 className="font-editorial text-2xl text-white">
                  Optical Craft
                </h2>
                <p className="text-xs text-[#A0A0A0] leading-relaxed">
                  Medium-format digital sensors paired with 120 film &amp; prime
                  summilux glass for cinematic depth.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#111111] p-6 space-y-3">
                <Film aria-hidden="true" className="h-5 w-5 text-[#C6A46A]" />
                <h2 className="font-editorial text-2xl text-white">
                  Uncompressed Masters
                </h2>
                <p className="text-xs text-[#A0A0A0] leading-relaxed">
                  Original photographic quality preserved without destructive
                  compression across our archive.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#111111] p-6 space-y-3">
                <Compass aria-hidden="true" className="h-5 w-5 text-[#C6A46A]" />
                <h2 className="font-editorial text-2xl text-white">
                  Global Presence
                </h2>
                <p className="text-xs text-[#A0A0A0] leading-relaxed">
                  Available for private celebrations, editorial essays, and brand
                  campaigns worldwide.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 rounded-full bg-[#C6A46A] text-[#080808] font-semibold px-7 py-3.5 text-xs tracking-[0.18em] uppercase hover:bg-[#d8b87d] transition-colors min-h-[48px]"
              >
                <span>View Portfolio</span>
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-xs tracking-[0.18em] uppercase text-white hover:border-[#C6A46A] hover:text-[#C6A46A] transition-colors min-h-[48px]"
              >
                <span>Commission the Studio</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080808] pt-32 px-8 text-center text-xs font-mono uppercase tracking-[0.2em] text-[#A0A0A0]">
          Loading studio profile...
        </div>
      }
    >
      <AboutContent />
    </Suspense>
  );
}

