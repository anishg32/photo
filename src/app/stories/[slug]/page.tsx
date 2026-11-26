import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Calendar, MapPin } from "lucide-react";
import { getGalleryImages, getStories, getStoryBySlug } from "@/lib/firestore";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const story = await getStoryBySlug(slug);
  if (!story) return { title: "Story Not Found" };
  return {
    title: story.title,
    description: story.description,
  };
}

async function StoryDetailContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [story, allStories, gallery] = await Promise.all([
    getStoryBySlug(slug),
    getStories(),
    getGalleryImages({ limitCount: 6, featuredOnly: true }),
  ]);

  if (!story) {
    notFound();
  }

  const paragraphs = story.content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const otherStories = allStories.filter((s) => s.slug !== story.slug).slice(0, 2);

  return (
    <article className="bg-[#080808] min-h-screen pb-24">
      {/* Large Cover Photograph */}
      <header className="relative min-h-[72dvh] flex items-end pt-36 pb-16 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 z-0">
          {story.coverImage ? (
            <Image
              src={story.coverImage}
              alt={story.title}
              fill
              priority
              fetchPriority="high"
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(198,164,106,0.14),transparent_55%),#0b0b0b]"
            />
          )}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/60 to-[#080808]/40"
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 sm:px-8 space-y-5">
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.2em] uppercase text-[#C6A46A] hover:text-white transition-colors"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            <span>All Visual Stories</span>
          </Link>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono uppercase tracking-[0.18em] text-[#C6A46A]">
            {story.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                {story.location}
              </span>
            )}
            {story.captureDate && (
              <span className="inline-flex items-center gap-1.5 text-white/80">
                <Calendar aria-hidden="true" className="h-3.5 w-3.5 text-[#C6A46A]" />
                {story.captureDate}
              </span>
            )}
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-normal text-white leading-[1.04]">
            {story.title}
          </h1>
          <p className="text-lg sm:text-xl text-[#D0D0D0] max-w-3xl font-light">
            {story.description}
          </p>
        </div>
      </header>

      {/* Narrative Body & Full-Width Story Photographs */}
      <div className="mx-auto max-w-5xl px-6 sm:px-8 pt-16 space-y-16">
        <div className="space-y-6">
          {paragraphs.map((paragraph, idx) => (
            <ScrollReveal key={idx} delay={idx * 0.05}>
              <p className="prose-editorial text-base sm:text-lg text-[#CCCCCC] leading-relaxed">
                {paragraph}
              </p>
            </ScrollReveal>
          ))}
        </div>

        {story.galleryImages && story.galleryImages.length > 0 && (
          <div className="space-y-14 pt-4">
            {story.galleryImages.map((frame, idx) => (
              <ScrollReveal key={`${frame.url}-${idx}`}>
                <figure className="space-y-4">
                  <div
                    className={`relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#111111] ${
                      frame.aspect === "portrait"
                        ? "aspect-[3/4] max-w-2xl mx-auto"
                        : "aspect-[16/10]"
                    }`}
                  >
                    <Image
                      src={frame.url}
                      alt={frame.caption || `${story.title} plate ${idx + 1}`}
                      fill
                      loading="lazy"
                      sizes="(max-width: 1024px) 100vw, 960px"
                      className="object-cover"
                    />
                  </div>
                  {frame.caption && (
                    <figcaption className="text-center font-mono text-xs tracking-[0.12em] text-[#A0A0A0]">
                      {String(idx + 1).padStart(2, "0")} — {frame.caption}
                    </figcaption>
                  )}
                </figure>
              </ScrollReveal>
            ))}
          </div>
        )}

        {/* Related Photography & Stories */}
        <section
          aria-label="Related Photography"
          className="pt-16 border-t border-white/10 space-y-8"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-editorial text-3xl sm:text-4xl text-white">
              Related Plates &amp; Journals
            </h2>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-1.5 text-xs tracking-[0.18em] uppercase text-[#C6A46A] hover:text-white transition-colors"
            >
              <span>Full Gallery</span>
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {gallery.items.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                href={`/categories/${item.categorySlug || "wedding"}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-[#111111]"
              >
                <Image
                  src={item.thumbnailUrl || item.imageUrl}
                  alt={item.title}
                  fill
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                  <p className="font-editorial text-lg text-white">
                    {item.title}
                  </p>
                  <p className="text-[11px] font-mono text-[#C6A46A]">
                    {item.location}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {otherStories.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              {otherStories.map((other) => (
                <Link
                  key={other.id}
                  href={`/stories/${other.slug}`}
                  className="group rounded-xl border border-white/10 bg-[#111111] p-6 hover:border-[#C6A46A]/50 transition-colors flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C6A46A]">
                      Continue Reading
                    </p>
                    <h3 className="font-editorial text-2xl text-white mt-1 group-hover:text-[#C6A46A] transition-colors">
                      {other.title}
                    </h3>
                  </div>
                  <ArrowUpRight aria-hidden="true" className="h-5 w-5 text-[#C6A46A] shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </article>
  );
}

export default function StorySlugPage(props: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080808] pt-36 text-center font-mono text-xs uppercase tracking-[0.2em] text-[#A0A0A0]">
          Opening visual essay...
        </div>
      }
    >
      <StoryDetailContent params={props.params} />
    </Suspense>
  );
}
