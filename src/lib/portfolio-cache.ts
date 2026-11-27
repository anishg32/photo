import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import {
  getCategories,
  getCategoryBySlug,
  getGalleryImages,
  getSiteSettings,
  getStories,
  getStoryBySlug,
  getTestimonials,
} from "./firestore";

export async function getCachedSiteSettings() {
  "use cache";
  cacheLife("minutes");
  cacheTag("site-settings", "portfolio");
  return getSiteSettings();
}

export async function getCachedCategories() {
  "use cache";
  cacheLife("minutes");
  cacheTag("categories", "portfolio");
  return getCategories();
}

export async function getCachedCategoryBySlug(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("categories", "portfolio");
  return getCategoryBySlug(slug);
}

export async function getCachedGalleryImages(options?: {
  categorySlug?: string;
  featuredOnly?: boolean;
  searchQuery?: string;
  limitCount?: number;
  offset?: number;
}) {
  "use cache";
  cacheLife("minutes");
  cacheTag("gallery", "portfolio");
  return getGalleryImages(options);
}

export async function getCachedStories() {
  "use cache";
  cacheLife("minutes");
  cacheTag("stories", "portfolio");
  return getStories();
}

export async function getCachedStoryBySlug(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("stories", "portfolio");
  return getStoryBySlug(slug);
}

export async function getCachedTestimonials() {
  "use cache";
  cacheLife("minutes");
  cacheTag("testimonials", "portfolio");
  return getTestimonials({ includePending: false });
}
