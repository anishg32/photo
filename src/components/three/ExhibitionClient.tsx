"use client";

import dynamic from "next/dynamic";
import type { GalleryImage } from "@/types";

const MuseumExhibition3D = dynamic(
  () =>
    import("@/components/three/MuseumExhibition3D").then(
      (mod) => mod.MuseumExhibition3D
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[76dvh] min-h-[540px] rounded-2xl border border-white/10 bg-[#0b0b0b] flex items-center justify-center font-mono text-xs uppercase tracking-[0.2em] text-[#C6A46A]">
        Loading 3D Exhibition...
      </div>
    ),
  }
);

export function ExhibitionClient({ images }: { images: GalleryImage[] }) {
  return <MuseumExhibition3D images={images} fullViewport />;
}

