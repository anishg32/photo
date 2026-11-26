"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  MapPin,
  Calendar,
  Expand,
  X,
  Upload,
  Camera,
} from "lucide-react";
import type { Category, GalleryImage } from "@/types";
import { LightboxDialog } from "./LightboxDialog";

interface GalleryExplorerProps {
  images: GalleryImage[];
  categories: Category[];
  initialCategorySlug?: string;
  hideCategoryFilter?: boolean;
  initialLimit?: number;
}

export function GalleryExplorer({
  images,
  categories,
  initialCategorySlug = "all",
  hideCategoryFilter = false,
  initialLimit = 12,
}: GalleryExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategorySlug);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(initialLimit);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredImages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return images.filter((img) => {
      const catMatch =
        selectedCategory === "all" || img.categorySlug === selectedCategory;
      if (!catMatch) return false;
      if (!q) return true;
      return (
        img.title.toLowerCase().includes(q) ||
        img.description.toLowerCase().includes(q) ||
        img.location.toLowerCase().includes(q) ||
        (img.categoryName?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [images, searchQuery, selectedCategory]);

  const displayedImages = filteredImages.slice(0, visibleCount);
  const hasMore = displayedImages.length < filteredImages.length;

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 border-b border-white/10">
        {!hideCategoryFilter && (
          <div
            role="group"
            aria-label="Filter gallery by category"
            className="flex flex-wrap items-center gap-2"
          >
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                setVisibleCount(initialLimit);
              }}
              aria-pressed={selectedCategory === "all"}
              className={`rounded-full px-4 py-2 text-xs tracking-[0.14em] uppercase transition-colors border min-h-[40px] ${
                selectedCategory === "all"
                  ? "border-[#C6A46A] bg-[#C6A46A] text-[#080808] font-medium"
                  : "border-white/15 bg-[#111111] text-[#A0A0A0] hover:text-white hover:border-white/30"
              }`}
            >
              All Frames
            </button>
            {categories.map((cat) => {
              const active = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.slug);
                    setVisibleCount(initialLimit);
                  }}
                  aria-pressed={active}
                  className={`rounded-full px-4 py-2 text-xs tracking-[0.14em] uppercase transition-colors border min-h-[40px] ${
                    active
                      ? "border-[#C6A46A] bg-[#C6A46A] text-[#080808] font-medium"
                      : "border-white/15 bg-[#111111] text-[#A0A0A0] hover:text-white hover:border-white/30"
                  }`}
                >
                  {cat.name.replace(" Photography", "")}
                </button>
              );
            })}
          </div>
        )}

        <search className="w-full lg:w-80 shrink-0">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="relative flex items-center"
          >
            <label htmlFor="gallery-search-input" className="visually-hidden">
              Search photographs by title, location, or description
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 h-4 w-4 text-[#A0A0A0]"
            />
            <input
              id="gallery-search-input"
              name="q"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, city, mood..."
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              className="studio-input w-full rounded-full pl-11 pr-10 py-2.5 text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search query"
                className="absolute right-3 inline-flex items-center justify-center rounded-full p-1 text-[#A0A0A0] hover:text-white"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            )}
          </form>
        </search>
      </div>

      <p className="font-mono text-xs tracking-[0.18em] uppercase text-[#A0A0A0]">
        Showing {displayedImages.length} of {filteredImages.length} Uploaded
        Plates
      </p>

      {displayedImages.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-12 sm:p-16 text-center space-y-4">
          <Camera
            aria-hidden="true"
            className="mx-auto h-9 w-9 text-[#C6A46A]/80"
          />
          {images.length === 0 ? (
            <>
              <p className="font-editorial text-3xl sm:text-4xl text-white">
                Your Exhibition Wall Awaits Your First Frame.
              </p>
              <p className="text-sm text-[#A0A0A0] max-w-md mx-auto">
                Sample photographs have been cleared. Sign in to the Studio
                Admin Dashboard to upload your own original photography directly
                to Firebase Storage &amp; Cloud Firestore.
              </p>
              <div className="pt-2">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 rounded-full bg-[#C6A46A] text-[#080808] font-semibold px-7 py-3 text-xs tracking-[0.18em] uppercase hover:bg-[#d8b87d] transition-colors min-h-[48px]"
                >
                  <Upload aria-hidden="true" className="h-4 w-4" />
                  <span>Upload Photographs in Admin</span>
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="font-editorial text-3xl text-white">
                No matching photographs found.
              </p>
              <p className="text-sm text-[#A0A0A0]">
                Try clearing your filter or searching another location or
                subject.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="mt-2 inline-flex items-center rounded-full border border-[#C6A46A]/60 px-6 py-2.5 text-xs tracking-[0.16em] uppercase text-[#C6A46A] hover:bg-[#C6A46A] hover:text-[#080808] transition-colors min-h-[44px]"
              >
                Reset Filters
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {displayedImages.map((img, idx) => {
            const aspectRatio =
              img.width && img.height ? img.width / img.height : 4 / 3;
            return (
              <article
                key={img.id}
                className="break-inside-avoid group relative overflow-hidden rounded-xl border border-white/10 bg-[#111111]"
              >
                <button
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  aria-label={`Inspect ${img.title} captured in ${img.location}`}
                  className="block w-full text-left focus-visible:outline-offset-2"
                >
                  <div
                    className="relative w-full overflow-hidden bg-[#0a0a0a]"
                    style={{ aspectRatio: String(aspectRatio) }}
                  >
                    <Image
                      src={img.thumbnailUrl || img.imageUrl}
                      alt={`${img.title} — ${img.description}`}
                      fill
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#080808]/95 via-[#080808]/20 to-transparent opacity-80 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity duration-400"
                    />
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/75 border border-[#C6A46A]/50 text-[#C6A46A]">
                        <Expand aria-hidden="true" className="h-4 w-4" />
                      </span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 space-y-1.5 border-t border-white/5">
                    <div className="flex items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-[#C6A46A]">
                      <span>{img.categoryName || "Fine Art"}</span>
                      <span>{img.captureDate}</span>
                    </div>
                    <h3 className="font-editorial text-xl sm:text-2xl text-white group-hover:text-[#C6A46A] transition-colors">
                      {img.title}
                    </h3>
                    <p className="text-xs text-[#A0A0A0] line-clamp-2">
                      {img.description}
                    </p>
                    <p className="pt-1 flex items-center gap-1.5 text-[11px] text-white/60">
                      <MapPin
                        aria-hidden="true"
                        className="h-3.5 w-3.5 text-[#C6A46A]"
                      />
                      <span>{img.location}</span>
                      <span aria-hidden="true" className="mx-1">
                        ·
                      </span>
                      <Calendar
                        aria-hidden="true"
                        className="h-3 w-3 text-[#C6A46A]"
                      />
                      <span className="font-mono">{img.captureDate}</span>
                    </p>
                  </div>
                </button>
              </article>
            );
          })}
        </div>
      )}

      {hasMore && (
        <div className="pt-4 text-center">
          <button
            type="button"
            onClick={() => setVisibleCount((v) => v + 9)}
            className="inline-flex items-center justify-center rounded-full border border-[#C6A46A]/60 px-8 py-3 text-xs tracking-[0.2em] uppercase text-[#C6A46A] hover:bg-[#C6A46A] hover:text-[#080808] transition-colors min-h-[48px]"
          >
            Load More Plates ({filteredImages.length - displayedImages.length}{" "}
            Remaining)
          </button>
        </div>
      )}

      <LightboxDialog
        images={displayedImages}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChangeIndex={setLightboxIndex}
      />
    </div>
  );
}
