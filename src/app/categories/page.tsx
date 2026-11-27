import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getCachedCategories } from "@/lib/portfolio-cache";

export const metadata: Metadata = {
  title: "Photography Categories",
  description:
    "Browse ten curated photography disciplines at MJ PHOTOGRAPHY: Wedding, Portrait, Nature, Landscape, Travel, Fashion, Events, Street, Product, and Wildlife.",
};

async function CategoriesGrid() {
  const categories = await getCachedCategories();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {categories.map((cat, idx) => (
        <Link
          key={cat.id}
          href={`/categories/${cat.slug}`}
          className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-[#111111]"
        >
          {cat.coverImage ? (
            <Image
              src={cat.coverImage}
              alt={cat.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(198,164,106,0.14),transparent_52%),linear-gradient(160deg,#151515_0%,#0c0c0c_100%)]"
            />
          )}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#080808]/95 via-[#080808]/40 to-transparent"
          />
          <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs tracking-[0.24em] text-[#C6A46A]">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white group-hover:border-[#C6A46A] group-hover:bg-[#C6A46A] group-hover:text-[#080808] transition-colors">
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </span>
            </div>
            <div>
              <h2 className="font-editorial text-3xl sm:text-4xl text-white">
                {cat.name}
              </h2>
              <p className="mt-2 text-sm text-[#CCCCCC] max-w-lg">
                {cat.description}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <div className="pt-32 pb-24 bg-[#080808] min-h-screen">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 space-y-14">
        <div className="max-w-3xl space-y-4 border-b border-white/10 pb-10">
          <p className="font-mono text-xs tracking-[0.28em] uppercase text-[#C6A46A]">
            Ten Disciplines
          </p>
          <h1 className="font-editorial text-5xl sm:text-6xl font-normal text-white">
            Photography Categories.
          </h1>
          <p className="text-sm sm:text-base text-[#A0A0A0]">
            Select any discipline to explore dedicated editorial plates,
            lighting studies, and commission examples.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="py-20 text-center font-mono text-xs uppercase tracking-[0.2em] text-[#A0A0A0]">
              Loading categories...
            </div>
          }
        >
          <CategoriesGrid />
        </Suspense>
      </div>
    </div>
  );
}

