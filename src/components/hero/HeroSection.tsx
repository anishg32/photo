"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const HeroThreeOverlay = dynamic(
  () =>
    import("@/components/three/HeroThreeOverlay").then(
      (mod) => mod.HeroThreeOverlay
    ),
  { ssr: false }
);

interface HeroSectionProps {
  brandName: string;
  tagline: string;
  supportingText: string;
  heroImageUrl?: string;
  floatingImages: string[];
}

export function HeroSection({
  brandName,
  tagline,
  supportingText,
  heroImageUrl,
  floatingImages,
}: HeroSectionProps) {
  return (
    <section
      aria-label="Hero Showcase"
      className="relative min-h-[100dvh] w-full flex items-end pb-16 sm:pb-24 pt-32 overflow-hidden bg-[#080808]"
    >
      {/* Full-screen backdrop: renders photographer's uploaded hero shot or dark architectural studio light */}
      <div className="absolute inset-0 z-0">
        {heroImageUrl ? (
          <Image
            src={heroImageUrl}
            alt={`${brandName} featured hero showcase`}
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-center scale-[1.02]"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_72%_32%,rgba(198,164,106,0.16),transparent_48%),radial-gradient(circle_at_24%_75%,rgba(198,164,106,0.08),transparent_45%),linear-gradient(135deg,#080808_0%,#111111_55%,#070707_100%)]"
          />
        )}

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#080808]/95 via-[#080808]/65 to-[#080808]/25"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]/55"
        />
      </div>

      {/* Floating 3D Frames & Subtle Gold Particles */}
      <HeroThreeOverlay images={floatingImages} />

      {/* Editorial Foreground Content */}
      <div className="relative z-20 mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="max-w-3xl space-y-7">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2.5 rounded-full border border-[#C6A46A]/35 bg-black/50 backdrop-blur-md px-4 py-1.5 text-[11px] font-mono tracking-[0.24em] uppercase text-[#C6A46A]"
          >
            <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
            <span>{brandName} · Fine Art Atelier</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-editorial text-5xl sm:text-7xl lg:text-[5.5rem] leading-[0.98] tracking-[-0.02em] font-normal text-white"
          >
            {tagline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-base sm:text-xl text-[#D0D0D0] max-w-xl font-light tracking-wide"
          >
            &ldquo;{supportingText}&rdquo;
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <Link
              href="/gallery"
              className="group inline-flex items-center gap-3 rounded-full bg-[#C6A46A] text-[#080808] px-7 py-3.5 text-xs font-semibold tracking-[0.2em] uppercase hover:bg-[#d8b87d] transition-colors min-h-[48px]"
            >
              <span>Explore Gallery</span>
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/exhibition"
              className="liquid-glass inline-flex items-center gap-3 rounded-full px-7 py-3.5 text-xs font-medium tracking-[0.2em] uppercase text-white hover:border-[#C6A46A]/60 hover:text-[#C6A46A] transition-colors min-h-[48px]"
            >
              <span>Discover My Work</span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll-to-Explore Indicator */}
      <div
        aria-hidden="true"
        className="hidden sm:flex flex-col items-center gap-3 absolute bottom-8 right-8 lg:right-12 z-20"
      >
        <span className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#C6A46A] [writing-mode:vertical-rl]">
          Scroll to Explore
        </span>
        <div className="h-12 w-px bg-white/15 overflow-hidden">
          <div className="scroll-line-pulse h-full w-full bg-[#C6A46A]" />
        </div>
      </div>
    </section>
  );
}
