"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { GalleryImage } from "@/types";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const MuseumExhibition3D = dynamic(
  () =>
    import("@/components/three/MuseumExhibition3D").then(
      (mod) => mod.MuseumExhibition3D
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[66dvh] min-h-[480px] rounded-2xl border border-white/10 bg-[#0b0b0b] flex items-center justify-center">
        <p className="font-mono text-xs tracking-[0.24em] uppercase text-[#C6A46A]">
          Illuminating 3D Exhibition Hall...
        </p>
      </div>
    ),
  }
);

export function VirtualMuseumSection({
  images,
}: {
  images: GalleryImage[];
}) {
  return (
    <section
      id="virtual-museum"
      className="heavy-exhibition-section py-24 sm:py-32 bg-[#0c0c0c] border-t border-white/5"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <p className="text-xs font-mono tracking-[0.28em] uppercase text-[#C6A46A]">
              04 · Interactive 3D Exhibition
            </p>
            <h2 className="mt-3 font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal text-white">
              Step Inside the Digital Pavilion.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#A0A0A0]">
              Navigate suspended museum plates in real-time Three.js lighting.
              Click any framed work to inspect its full-resolution negative and
              provenance.
            </p>
          </div>
          <Link
            href="/exhibition"
            className="inline-flex items-center gap-2 rounded-full border border-[#C6A46A]/60 px-6 py-3 text-xs tracking-[0.18em] uppercase text-[#C6A46A] hover:bg-[#C6A46A] hover:text-[#080808] transition-colors min-h-[48px] shrink-0"
          >
            <span>Enter Fullscreen 3D Wing</span>
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </ScrollReveal>

        <MuseumExhibition3D images={images} />
      </div>
    </section>
  );
}

