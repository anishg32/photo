import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Eye } from "lucide-react";
import {
  getCachedCategories,
  getCachedGalleryImages,
} from "@/lib/portfolio-cache";
import { GalleryExplorer } from "@/components/gallery/GalleryExplorer";

export const metadata: Metadata = {
  title: "Photography Gallery",
  description:
    "Explore the complete MJ PHOTOGRAPHY curated archive across weddings, portraits, fashion, landscapes, street, travel, events, product, and wildlife.",
};

async function GalleryContent() {
  const [categories, gallery] = await Promise.all([
    getCachedCategories(),
    getCachedGalleryImages({ limitCount: 100 }),
  ]);

  return (
    <GalleryExplorer
      images={gallery.items}
      categories={categories}
      initialLimit={12}
    />
  );
}

export default function GalleryPage() {
  return (
    <div className="pt-32 pb-24 bg-[#080808] min-h-screen">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-10">
          <div className="space-y-4 max-w-2xl">
            <p className="font-mono text-xs tracking-[0.28em] uppercase text-[#C6A46A]">
              Archival Collection
            </p>
            <h1 className="font-editorial text-5xl sm:text-6xl font-normal text-white">
              The Complete Gallery.
            </h1>
            <p className="text-sm sm:text-base text-[#A0A0A0]">
              Filter by discipline or search by location, camera craft, and
              mood. Select any plate to enter full-screen inspection.
            </p>
          </div>
          <Link
            href="/exhibition"
            className="inline-flex items-center gap-2 rounded-full border border-[#C6A46A]/60 bg-[#C6A46A]/10 px-6 py-3 text-xs tracking-[0.16em] uppercase text-[#C6A46A] hover:bg-[#C6A46A] hover:text-[#080808] transition-colors min-h-[44px] self-start md:self-auto"
          >
            <Eye aria-hidden="true" className="h-4 w-4" />
            <span>View in 3D Museum</span>
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="py-20 text-center font-mono text-xs uppercase tracking-[0.2em] text-[#A0A0A0]">
              Loading archival gallery...
            </div>
          }
        >
          <GalleryContent />
        </Suspense>
      </div>
    </div>
  );
}

