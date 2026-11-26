import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getGalleryImages } from "@/lib/firestore";
import { ExhibitionClient } from "@/components/three/ExhibitionClient";

export const metadata: Metadata = {
  title: "3D Virtual Photography Museum",
  description:
    "Step inside MJ PHOTOGRAPHY's interactive Three.js virtual art gallery. Orbit illuminated photographic frames and inspect high-resolution plates.",
};

async function ExhibitionContent() {
  const gallery = await getGalleryImages({ limitCount: 12 });
  return <ExhibitionClient images={gallery.items} />;
}

export default function ExhibitionPage() {
  return (
    <div className="pt-28 pb-20 bg-[#050505] min-h-screen">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-3">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.2em] uppercase text-[#C6A46A] hover:text-white transition-colors"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              <span>Return to 2D Gallery</span>
            </Link>
            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal text-white">
              Virtual Photography Museum.
            </h1>
            <p className="text-sm text-[#A0A0A0] max-w-2xl">
              Drag to orbit or use the guided exhibition tour below. Click any
              illuminated frame to inspect full-resolution detail and provenance.
            </p>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="h-[74dvh] min-h-[520px] rounded-2xl border border-white/10 bg-[#0b0b0b] flex items-center justify-center font-mono text-xs uppercase tracking-[0.2em] text-[#C6A46A]">
              Preparing 3D Pavilion...
            </div>
          }
        >
          <ExhibitionContent />
        </Suspense>
      </div>
    </div>
  );
}

