import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Category, GalleryImage } from "@/types";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { GalleryExplorer } from "@/components/gallery/GalleryExplorer";

export function FeaturedGallerySection({
  images,
  categories,
}: {
  images: GalleryImage[];
  categories: Category[];
}) {
  return (
    <section
      id="featured-gallery"
      className="py-24 sm:py-32 bg-[#080808] border-t border-white/5"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs font-mono tracking-[0.28em] uppercase text-[#C6A46A]">
              03 · Featured Collection
            </p>
            <h2 className="mt-3 font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal text-white">
              Selected Archival Frames.
            </h2>
          </div>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#C6A46A] hover:text-white transition-colors min-h-[44px]"
          >
            <span>Open Complete Archive</span>
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </ScrollReveal>

        <GalleryExplorer
          images={images}
          categories={categories}
          initialLimit={9}
        />
      </div>
    </section>
  );
}

