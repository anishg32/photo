import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/types";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

export function CategoriesSection({ categories }: { categories: Category[] }) {
  return (
    <section
      id="categories"
      className="py-24 sm:py-32 bg-[#0c0c0c] border-t border-white/5"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 lg:mb-20">
          <div>
            <p className="text-xs font-mono tracking-[0.28em] uppercase text-[#C6A46A]">
              02 · Curated Disciplines
            </p>
            <h2 className="mt-3 font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal text-white">
              Ten Lenses on the World.
            </h2>
          </div>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#C6A46A] hover:text-white transition-colors min-h-[44px]"
          >
            <span>Explore All Categories</span>
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
          {categories.map((cat, idx) => {
            const spanClass =
              idx % 5 === 0
                ? "md:col-span-7 aspect-[16/10]"
                : idx % 5 === 1
                  ? "md:col-span-5 aspect-[4/5]"
                  : "md:col-span-4 aspect-[4/5]";

            return (
              <ScrollReveal
                key={cat.id}
                delay={(idx % 3) * 0.06}
                className={spanClass}
              >
                <Link
                  href={`/categories/${cat.slug}`}
                  className="group relative block h-full w-full overflow-hidden rounded-xl border border-white/10 bg-[#111111] hover:border-[#C6A46A]/55 transition-colors"
                >
                  {cat.coverImage ? (
                    <Image
                      src={cat.coverImage}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(198,164,106,0.14),transparent_52%),linear-gradient(160deg,#151515_0%,#0c0c0c_100%)]"
                    />
                  )}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#080808]/95 via-[#080808]/35 to-transparent transition-opacity duration-500 group-hover:opacity-90"
                  />
                  <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs tracking-[0.24em] text-[#C6A46A]">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition-all duration-300 group-hover:border-[#C6A46A] group-hover:bg-[#C6A46A] group-hover:text-[#080808]">
                        <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                      </span>
                    </div>
                    <div>
                      <h3 className="font-editorial text-2xl sm:text-3xl text-white">
                        {cat.name}
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-[#CCCCCC] line-clamp-2 max-w-md">
                        {cat.description}
                      </p>
                      {!cat.coverImage && (
                        <p className="mt-3 font-mono text-[10px] tracking-[0.18em] uppercase text-[#C6A46A]/85">
                          Ready for Your Photographs
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
