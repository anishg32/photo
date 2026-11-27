import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { getCachedCategories, getCachedSiteSettings } from "@/lib/portfolio-cache";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

export const metadata: Metadata = {
  title: "Photography Services",
  description:
    "Bespoke wedding, portrait, event, travel, fashion, product, and executive photography commissions by MJ PHOTOGRAPHY.",
};

async function ServicesPageContent() {
  const [settings, categories] = await Promise.all([
    getCachedSiteSettings(),
    getCachedCategories(),
  ]);

  const catMap = new Map(categories.map((c) => [c.slug, c]));

  return (
    <div className="space-y-12">
      {settings.services.map((service, idx) => {
        const matchedCat = catMap.get(service.categorySlug);
        const image = matchedCat?.coverImage;

        return (
          <ScrollReveal key={service.id} delay={(idx % 3) * 0.05}>
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-2xl border border-white/10 bg-[#111111] p-6 sm:p-8">
              <div className="lg:col-span-5 relative aspect-[4/3] overflow-hidden rounded-xl bg-[#080808] border border-white/5 flex items-center justify-center">
                {image ? (
                  <Image
                    src={image}
                    alt={service.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="p-8 text-center space-y-2">
                    <span className="font-mono text-3xl text-[#C6A46A]">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <p className="font-editorial text-2xl text-white/90">
                      {service.title}
                    </p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-7 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs tracking-[0.24em] uppercase text-[#C6A46A]">
                    Service {String(idx + 1).padStart(2, "0")}
                  </span>
                  {service.startingPrice && (
                    <span className="rounded-full border border-[#C6A46A]/45 bg-[#C6A46A]/10 px-4 py-1 font-mono text-xs text-[#C6A46A]">
                      {service.startingPrice}
                    </span>
                  )}
                </div>

                <h2 className="font-editorial text-3xl sm:text-4xl text-white">
                  {service.title}
                </h2>
                <p className="text-sm sm:text-base text-[#A0A0A0] leading-relaxed">
                  {service.description}
                </p>

                {service.deliverables && service.deliverables.length > 0 && (
                  <ul className="space-y-2 pt-2 list-none p-0 m-0">
                    {service.deliverables.map((del) => (
                      <li
                        key={del}
                        className="flex items-start gap-2.5 text-sm text-[#CCCCCC]"
                      >
                        <Check
                          aria-hidden="true"
                          className="h-4 w-4 text-[#C6A46A] mt-0.5 shrink-0"
                        />
                        <span>{del}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {service.pricingNote && (
                  <p className="text-xs font-mono text-[#A0A0A0]">
                    {service.pricingNote}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-3">
                  <Link
                    href={`/contact?service=${encodeURIComponent(service.title)}`}
                    className="inline-flex items-center gap-2 rounded-full bg-[#C6A46A] text-[#080808] font-semibold px-6 py-3 text-xs tracking-[0.18em] uppercase hover:bg-[#d8b87d] transition-colors min-h-[44px]"
                  >
                    <span>Enquire for Availability</span>
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                  {matchedCat && (
                    <Link
                      href={`/categories/${matchedCat.slug}`}
                      className="inline-flex items-center rounded-full border border-white/20 px-5 py-3 text-xs tracking-[0.16em] uppercase text-white hover:border-[#C6A46A] hover:text-[#C6A46A] transition-colors min-h-[44px]"
                    >
                      View {matchedCat.name}
                    </Link>
                  )}
                </div>
              </div>
            </section>
          </ScrollReveal>
        );
      })}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <div className="pt-32 pb-24 bg-[#080808] min-h-screen">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 space-y-14">
        <div className="max-w-3xl space-y-4 border-b border-white/10 pb-10">
          <p className="font-mono text-xs tracking-[0.28em] uppercase text-[#C6A46A]">
            Commissions &amp; Studio Offerings
          </p>
          <h1 className="font-editorial text-5xl sm:text-6xl font-normal text-white">
            Photography Services.
          </h1>
          <p className="text-sm sm:text-base text-[#A0A0A0]">
            Custom-tailored editorial production and private commissions.
            Consult with our studio desk for custom multi-day itineraries and
            usage licensing.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="py-20 text-center font-mono text-xs uppercase tracking-[0.2em] text-[#A0A0A0]">
              Loading studio services...
            </div>
          }
        >
          <ServicesPageContent />
        </Suspense>
      </div>
    </div>
  );
}

