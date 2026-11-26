import { Suspense } from "react";
import {
  getCategories,
  getGalleryImages,
  getSiteSettings,
  getStories,
  getTestimonials,
} from "@/lib/firestore";
import { HeroSection } from "@/components/hero/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { FeaturedGallerySection } from "@/components/sections/FeaturedGallerySection";
import { VirtualMuseumSection } from "@/components/sections/VirtualMuseumSection";
import { StoriesSection } from "@/components/sections/StoriesSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { ContactSection } from "@/components/sections/ContactSection";
import {
  DEFAULT_SITE_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_GALLERY_IMAGES,
  INITIAL_STORIES,
} from "@/lib/studio-catalog";

async function DynamicPortfolioSections() {
  const [categories, gallery, stories, testimonials, settings] =
    await Promise.all([
      getCategories(),
      getGalleryImages({ limitCount: 24 }),
      getStories(),
      getTestimonials({ includePending: false }),
      getSiteSettings(),
    ]);

  const featuredImages = gallery.items.filter((i) => i.featured);
  const exhibitionPool =
    featuredImages.length >= 3 ? featuredImages : gallery.items;
  const heroImageUrl =
    settings.heroImageUrl || exhibitionPool[0]?.imageUrl || "";
  const floatingImages = exhibitionPool
    .slice(0, 3)
    .map((i) => i.thumbnailUrl || i.imageUrl)
    .filter(Boolean);

  return (
    <>
      <HeroSection
        brandName={settings.brandName}
        tagline={settings.tagline}
        supportingText={settings.supportingText}
        heroImageUrl={heroImageUrl}
        floatingImages={floatingImages}
      />
      <AboutSection
        headline={settings.aboutHeadline}
        bio={settings.aboutBio}
        aboutImageUrl={settings.aboutImageUrl}
      />
      <CategoriesSection categories={categories} />
      <FeaturedGallerySection
        images={gallery.items}
        categories={categories}
      />
      <VirtualMuseumSection images={exhibitionPool} />
      <StoriesSection stories={stories} />
      <ServicesSection services={settings.services} categories={categories} />
      <TestimonialsSection testimonials={testimonials} />
      <ContactSection settings={settings} />
    </>
  );
}

function HomeFallback() {
  return (
    <>
      <HeroSection
        brandName={DEFAULT_SITE_SETTINGS.brandName}
        tagline={DEFAULT_SITE_SETTINGS.tagline}
        supportingText={DEFAULT_SITE_SETTINGS.supportingText}
        heroImageUrl=""
        floatingImages={[]}
      />
      <AboutSection
        headline={DEFAULT_SITE_SETTINGS.aboutHeadline}
        bio={DEFAULT_SITE_SETTINGS.aboutBio}
        aboutImageUrl=""
      />
      <CategoriesSection categories={INITIAL_CATEGORIES} />
      <FeaturedGallerySection
        images={INITIAL_GALLERY_IMAGES}
        categories={INITIAL_CATEGORIES}
      />
      <VirtualMuseumSection images={INITIAL_GALLERY_IMAGES} />
      <StoriesSection stories={INITIAL_STORIES} />
      <ServicesSection
        services={DEFAULT_SITE_SETTINGS.services}
        categories={INITIAL_CATEGORIES}
      />
      <TestimonialsSection testimonials={[]} />
      <ContactSection settings={DEFAULT_SITE_SETTINGS} />
    </>
  );
}

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "MJ PHOTOGRAPHY",
    description:
      "Every frame tells a story. Luxury photography portfolio, cinematic wedding, portrait, fashion, editorial, and 3D digital art gallery.",
    slogan: "EVERY FRAME TELLS A STORY.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://mjphotography.art",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<HomeFallback />}>
        <DynamicPortfolioSections />
      </Suspense>
    </>
  );
}
