import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, Calendar } from "lucide-react";
import { getCachedStories } from "@/lib/portfolio-cache";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

export const metadata: Metadata = {
  title: "Photography Stories",
  description:
    "Long-form visual essays, destination diaries, and editorial narratives from MJ PHOTOGRAPHY.",
};

async function StoriesArchive() {
  const stories = await getCachedStories();

  return (
    <div className="space-y-12">
      {stories.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-12 text-center">
          <p className="font-editorial text-3xl text-white">
            Visual Essays Coming Soon
          </p>
          <p className="mt-2 text-sm text-[#A0A0A0]">
            Published photography stories from our studio archive appear here.
          </p>
        </div>
      ) : (
        stories.map((story, idx) => (
          <ScrollReveal key={story.id} delay={idx * 0.06}>
            <article className="group grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-2xl border border-white/10 bg-[#111111] p-6 sm:p-8 hover:border-[#C6A46A]/45 transition-colors">
              <Link
                href={`/stories/${story.slug}`}
                className="lg:col-span-7 relative aspect-[16/10] overflow-hidden rounded-xl bg-[#080808]"
              >
                <Image
                  src={story.coverImage}
                  alt={story.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </Link>

              <div className="lg:col-span-5 space-y-5">
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-[0.16em] text-[#C6A46A]">
                  <span>Visual Essay {String(idx + 1).padStart(2, "0")}</span>
                  {story.captureDate && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 text-[#A0A0A0]">
                        <Calendar aria-hidden="true" className="h-3.5 w-3.5 text-[#C6A46A]" />
                        {story.captureDate}
                      </span>
                    </>
                  )}
                </div>

                <h2 className="font-editorial text-3xl sm:text-4xl text-white">
                  <Link
                    href={`/stories/${story.slug}`}
                    className="hover:text-[#C6A46A] transition-colors"
                  >
                    {story.title}
                  </Link>
                </h2>

                {story.location && (
                  <p className="flex items-center gap-1.5 text-xs text-[#A0A0A0]">
                    <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-[#C6A46A]" />
                    <span>{story.location}</span>
                  </p>
                )}

                <p className="text-sm sm:text-base text-[#A0A0A0] leading-relaxed">
                  {story.description}
                </p>

                <Link
                  href={`/stories/${story.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-xs tracking-[0.18em] uppercase text-white group-hover:border-[#C6A46A] group-hover:text-[#C6A46A] transition-colors min-h-[44px]"
                >
                  <span>Read Story</span>
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            </article>
          </ScrollReveal>
        ))
      )}
    </div>
  );
}

export default function StoriesPage() {
  return (
    <div className="pt-32 pb-24 bg-[#080808] min-h-screen">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 space-y-14">
        <div className="max-w-3xl space-y-4 border-b border-white/10 pb-10">
          <p className="font-mono text-xs tracking-[0.28em] uppercase text-[#C6A46A]">
            Editorial Journals
          </p>
          <h1 className="font-editorial text-5xl sm:text-6xl font-normal text-white">
            Photography Stories.
          </h1>
          <p className="text-sm sm:text-base text-[#A0A0A0]">
            Extended photo essays pairing full-bleed plates with field notes
            from destination celebrations and expeditions.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="py-20 text-center font-mono text-xs uppercase tracking-[0.2em] text-[#A0A0A0]">
              Loading stories...
            </div>
          }
        >
          <StoriesArchive />
        </Suspense>
      </div>
    </div>
  );
}

