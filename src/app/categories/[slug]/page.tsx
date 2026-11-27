import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import {
  getCachedCategories,
  getCachedCategoryBySlug,
  getCachedGalleryImages,
} from "@/lib/portfolio-cache";
import { INITIAL_CATEGORIES } from "@/lib/studio-catalog";
import { GalleryExplorer } from "@/components/gallery/GalleryExplorer";

export function generateStaticParams() {
  return INITIAL_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const category = await getCachedCategoryBySlug(slug);
  if (!category) {
    return { title: "Category Not Found" };
  }
  return {
    title: category.name,
    description: category.description,
  };
}

async function CategoryDetailContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, allCategories, gallery] = await Promise.all([
    getCachedCategoryBySlug(slug),
    getCachedCategories(),
    getCachedGalleryImages({ categorySlug: slug, limitCount: 60 }),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="bg-[#080808] min-h-screen pb-24">
      {/* Editorial Category Hero */}
      <section className="relative min-h-[62dvh] flex items-end pt-36 pb-16 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 z-0">
          {category.coverImage ? (
            <Image
              src={category.coverImage}
              alt={category.name}
              fill
              priority
              fetchPriority="high"
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(198,164,106,0.16),transparent_55%),linear-gradient(135deg,#080808_0%,#121212_100%)]"
            />
          )}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/65 to-[#080808]/45"
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12 space-y-5">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.2em] uppercase text-[#C6A46A] hover:text-white transition-colors"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            <span>All Categories</span>
          </Link>

          <h1 className="font-editorial text-5xl sm:text-6xl lg:text-7xl font-normal text-white">
            {category.name}
          </h1>
          <p className="text-base sm:text-lg text-[#D0D0D0] max-w-2xl">
            {category.description}
          </p>

          <div className="pt-2">
            <Link
              href={`/contact?service=${encodeURIComponent(category.name)}`}
              className="inline-flex items-center gap-2 rounded-full bg-[#C6A46A] text-[#080808] font-semibold px-6 py-3 text-xs tracking-[0.18em] uppercase hover:bg-[#d8b87d] transition-colors min-h-[44px]"
            >
              <span>Inquire About {category.name}</span>
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Filtered Category Gallery */}
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 pt-16">
        <GalleryExplorer
          images={gallery.items}
          categories={allCategories}
          initialCategorySlug={slug}
          hideCategoryFilter
          initialLimit={18}
        />
      </div>
    </div>
  );
}

export default function CategorySlugPage(props: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080808] pt-36 text-center font-mono text-xs uppercase tracking-[0.2em] text-[#A0A0A0]">
          Loading category exhibition...
        </div>
      }
    >
      <CategoryDetailContent params={props.params} />
    </Suspense>
  );
}
