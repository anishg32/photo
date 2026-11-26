import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Category, StudioService } from "@/types";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

export function ServicesSection({
  services,
  categories,
}: {
  services: StudioService[];
  categories: Category[];
}) {
  const categoryMap = new Map(categories.map((c) => [c.slug, c]));

  return (
    <section
      id="services"
      className="py-24 sm:py-32 bg-[#0c0c0c] border-t border-white/5"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="max-w-2xl">
            <p className="text-xs font-mono tracking-[0.28em] uppercase text-[#C6A46A]">
              06 · Studio Commissions
            </p>
            <h2 className="mt-3 font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal text-white">
              Bespoke Photography Services.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#A0A0A0]">
              Every assignment is scoped individually around light, location, and
              deliverable requirements.
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#C6A46A] hover:text-white transition-colors min-h-[44px]"
          >
            <span>Explore Full Offerings</span>
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </ScrollReveal>

        <div className="divide-y divide-white/10 border-y border-white/10">
          {services.map((service, idx) => {
            const matchedCat = categoryMap.get(service.categorySlug);
            const previewImage = matchedCat?.coverImage;

            return (
              <ScrollReveal key={service.id} delay={(idx % 4) * 0.05}>
                <div className="py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                  <div className="lg:col-span-3 flex items-center gap-5">
                    <span className="font-mono text-xs text-[#C6A46A]">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    {previewImage ? (
                      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#111111]">
                        <Image
                          src={previewImage}
                          alt={service.title}
                          fill
                          loading="lazy"
                          sizes="112px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-px flex-1 bg-white/10" aria-hidden="true" />
                    )}
                  </div>

                  <div className="lg:col-span-6 space-y-2">
                    <h3 className="font-editorial text-2xl sm:text-3xl text-white">
                      {service.title}
                    </h3>
                    <p className="text-sm text-[#A0A0A0] leading-relaxed">
                      {service.description}
                    </p>
                    {service.startingPrice && (
                      <p className="pt-1 font-mono text-xs text-[#C6A46A]">
                        {service.startingPrice}
                        {service.pricingNote ? ` · ${service.pricingNote}` : ""}
                      </p>
                    )}
                  </div>

                  <div className="lg:col-span-3 flex flex-wrap lg:justify-end gap-3">
                    {matchedCat && (
                      <Link
                        href={`/categories/${matchedCat.slug}`}
                        className="inline-flex items-center rounded-full border border-white/15 px-4 py-2.5 text-xs tracking-[0.14em] uppercase text-[#A0A0A0] hover:text-white hover:border-white/30 transition-colors min-h-[44px]"
                      >
                        Related Work
                      </Link>
                    )}
                    <Link
                      href={`/contact?service=${encodeURIComponent(service.title)}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#C6A46A]/15 border border-[#C6A46A]/50 px-5 py-2.5 text-xs tracking-[0.14em] uppercase text-[#C6A46A] hover:bg-[#C6A46A] hover:text-[#080808] transition-colors min-h-[44px]"
                    >
                      <span>Enquire</span>
                      <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
