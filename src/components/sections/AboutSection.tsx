"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Aperture, ArrowUpRight } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

gsap.registerPlugin(ScrollTrigger);

interface AboutSectionProps {
  headline: string;
  bio: string;
  aboutImageUrl?: string;
}

export function AboutSection({
  headline,
  bio,
  aboutImageUrl,
}: AboutSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (!imageWrapRef.current || !sectionRef.current) return;
      gsap.fromTo(
        imageWrapRef.current,
        { y: 24, scale: 1.03 },
        {
          y: -16,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative py-24 sm:py-32 lg:py-40 bg-[#080808] border-t border-white/5 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Editorial Photographer Portrait or Architectural Darkroom Plate */}
          <div className="lg:col-span-5">
            <ScrollReveal>
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-white/10 bg-[#111111]">
                {aboutImageUrl ? (
                  <div ref={imageWrapRef} className="absolute inset-0">
                    <Image
                      src={aboutImageUrl}
                      alt="Photographer studio portrait"
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    ref={imageWrapRef}
                    className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[radial-gradient(circle_at_center,rgba(198,164,106,0.12),transparent_60%),linear-gradient(180deg,#121212_0%,#090909_100%)]"
                  >
                    <div className="h-20 w-20 rounded-full border border-[#C6A46A]/40 flex items-center justify-center mb-6">
                      <Aperture
                        aria-hidden="true"
                        className="h-9 w-9 text-[#C6A46A]"
                      />
                    </div>
                    <p className="font-editorial text-2xl text-white">
                      Studio Portrait Frame
                    </p>
                    <p className="mt-2 text-xs text-[#A0A0A0] max-w-xs">
                      Upload your own studio portrait in Admin Settings to
                      display it here.
                    </p>
                    <Link
                      href="/admin"
                      className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-[#C6A46A]/50 px-5 py-2.5 text-[11px] font-mono uppercase tracking-[0.16em] text-[#C6A46A] hover:bg-[#C6A46A] hover:text-[#080808] transition-colors"
                    >
                      <span>Upload Portrait</span>
                      <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080808]/75 via-transparent to-transparent"
                />
                <div className="pointer-events-none absolute bottom-5 left-5 right-5 flex items-center justify-between text-[11px] font-mono tracking-[0.18em] uppercase text-white/80">
                  <span>Medium Format &amp; Digital Atelier</span>
                  <span className="text-[#C6A46A]">MJ Studio</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Narrative & Philosophy */}
          <div className="lg:col-span-7 space-y-8">
            <ScrollReveal>
              <p className="text-xs font-mono tracking-[0.28em] uppercase text-[#C6A46A]">
                01 · About The Studio
              </p>
              <h2 className="mt-4 font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.06] text-white">
                {headline}
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p className="prose-editorial text-base sm:text-lg text-[#A0A0A0] leading-relaxed">
                {bio}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/10">
                <div>
                  <p className="font-editorial text-3xl text-[#C6A46A]">
                    12+ Years
                  </p>
                  <p className="mt-1 text-xs tracking-[0.14em] uppercase text-[#A0A0A0]">
                    Editorial &amp; Fine Art Craft
                  </p>
                </div>
                <div>
                  <p className="font-editorial text-3xl text-[#C6A46A]">
                    Original Masters
                  </p>
                  <p className="mt-1 text-xs tracking-[0.14em] uppercase text-[#A0A0A0]">
                    Zero Lossy Compression
                  </p>
                </div>
                <div>
                  <p className="font-editorial text-3xl text-[#C6A46A]">
                    Medium Format
                  </p>
                  <p className="mt-1 text-xs tracking-[0.14em] uppercase text-[#A0A0A0]">
                    Archival Silver &amp; Digital
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-xs tracking-[0.18em] uppercase text-white hover:border-[#C6A46A] hover:text-[#C6A46A] transition-colors min-h-[48px]"
                >
                  <span>Read Studio Philosophy</span>
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
