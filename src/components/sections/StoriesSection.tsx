import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen, MapPin, Upload } from "lucide-react";
import type { Story } from "@/types";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

export function StoriesSection({ stories }: { stories: Story[] }) {
  return (
    <section
      id="stories"
      className="py-24 sm:py-32 bg-[#080808] border-t border-white/5"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <p className="text-xs font-mono tracking-[0.28em] uppercase text-[#C6A46A]">
              05 · Visual Essays
            </p>
            <h2 className="mt-3 font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal text-white">
              Featured Photography Stories.
            </h2>
          </div>
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#C6A46A] hover:text-white transition-colors min-h-[44px]"
          >
            <span>Open Stories Archive</span>
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </ScrollReveal>

        {stories.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#111111] p-12 sm:p-14 text-center space-y-4">
            <BookOpen
              aria-hidden="true"
              className="mx-auto h-8 w-8 text-[#C6A46A]/80"
            />
            <p className="font-editorial text-3xl text-white">
              Visual Essays Ready to Publish
            </p>
            <p className="text-sm text-[#A0A0A0] max-w-md mx-auto">
              Compose and publish your own editorial photography stories with
              cover photographs and essays from Studio Admin.
            </p>
            <div className="pt-2">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-full border border-[#C6A46A]/55 px-6 py-3 text-xs uppercase tracking-[0.16em] text-[#C6A46A] hover:bg-[#C6A46A] hover:text-[#080808] transition-colors min-h-[44px]"
              >
                <Upload aria-hidden="true" className="h-4 w-4" />
                <span>Create Story in Admin</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {stories.slice(0, 3).map((story, idx) => (
              <ScrollReveal key={story.id} delay={idx * 0.08}>
                <article className="group grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-2xl border border-white/10 bg-[#111111] p-5 sm:p-8 hover:border-[#C6A46A]/45 transition-colors">
                  <Link
                    href={`/stories/${story.slug}`}
                    className={`lg:col-span-7 relative aspect-[16/10] overflow-hidden rounded-xl bg-[#080808] ${
                      idx % 2 === 1 ? "lg:order-2" : ""
                    }`}
                  >
                    {story.coverImage && (
                      <Image
                        src={story.coverImage}
                        alt={story.title}
                        fill
                        loading="lazy"
                        sizes="(max-width: 1024px) 100vw, 58vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                  </Link>

                  <div
                    className={`lg:col-span-5 space-y-5 ${
                      idx % 2 === 1 ? "lg:order-1" : ""
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-[0.16em] text-[#C6A46A]">
                      <span>Essay {String(idx + 1).padStart(2, "0")}</span>
                      {story.location && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1 text-[#A0A0A0]">
                            <MapPin
                              aria-hidden="true"
                              className="h-3.5 w-3.5 text-[#C6A46A]"
                            />
                            {story.location}
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="font-editorial text-3xl sm:text-4xl text-white leading-tight">
                      <Link
                        href={`/stories/${story.slug}`}
                        className="hover:text-[#C6A46A] transition-colors"
                      >
                        {story.title}
                      </Link>
                    </h3>

                    <p className="text-sm sm:text-base text-[#A0A0A0] leading-relaxed">
                      {story.description}
                    </p>

                    <div className="pt-2">
                      <Link
                        href={`/stories/${story.slug}`}
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-xs tracking-[0.18em] uppercase text-white group-hover:border-[#C6A46A] group-hover:text-[#C6A46A] transition-colors min-h-[44px]"
                      >
                        <span>Open Visual Story</span>
                        <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
