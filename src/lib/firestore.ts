import "server-only";
import type {
  Booking,
  BookingStatus,
  Category,
  DashboardOverview,
  GalleryImage,
  SiteSettings,
  Story,
  Testimonial,
} from "@/types";
import { getAdminDb } from "./firebase-admin";
import {
  DEFAULT_SITE_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_GALLERY_IMAGES,
  INITIAL_STORIES,
} from "./studio-catalog";

function serializeTimestamp(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (typeof value === "string") return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (value instanceof Date) return value.toISOString();
  return new Date().toISOString();
}

export async function getCategories(options?: {
  allowFallback?: boolean;
}): Promise<Category[]> {
  const allowFallback = options?.allowFallback ?? true;
  const db = getAdminDb();

  if (db) {
    try {
      const snap = await db
        .collection("categories")
        .orderBy("displayOrder", "asc")
        .get();
      if (!snap.empty) {
        return snap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: String(data.name ?? ""),
            slug: String(data.slug ?? ""),
            description: String(data.description ?? ""),
            coverImage: String(data.coverImage ?? ""),
            displayOrder: Number(data.displayOrder ?? 0),
            createdAt: serializeTimestamp(data.createdAt),
          };
        });
      }
    } catch {
      // Fall back gracefully if Firestore isn't initialized yet
    }
  }

  return allowFallback ? INITIAL_CATEGORIES : [];
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function getGalleryImages(options?: {
  categorySlug?: string;
  categoryId?: string;
  featuredOnly?: boolean;
  includeUnpublished?: boolean;
  searchQuery?: string;
  limitCount?: number;
  offset?: number;
  allowFallback?: boolean;
}): Promise<{ items: GalleryImage[]; total: number }> {
  const {
    categorySlug,
    categoryId,
    featuredOnly = false,
    includeUnpublished = false,
    searchQuery,
    limitCount,
    offset = 0,
    allowFallback = true,
  } = options ?? {};

  const db = getAdminDb();
  let items: GalleryImage[] = [];
  let loadedFromDb = false;

  if (db) {
    try {
      let query: FirebaseFirestore.Query = db.collection("gallery_images");
      if (!includeUnpublished) {
        query = query.where("published", "==", true);
      }
      if (categoryId) {
        query = query.where("categoryId", "==", categoryId);
      }
      if (featuredOnly) {
        query = query.where("featured", "==", true);
      }

      const snap = await query.orderBy("displayOrder", "asc").get();
      if (!snap.empty || !allowFallback) {
        loadedFromDb = true;
        items = snap.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            title: String(d.title ?? ""),
            description: String(d.description ?? ""),
            imageUrl: String(d.imageUrl ?? ""),
            thumbnailUrl: String(d.thumbnailUrl ?? d.imageUrl ?? ""),
            categoryId: String(d.categoryId ?? ""),
            categoryName: d.categoryName ? String(d.categoryName) : undefined,
            categorySlug: d.categorySlug ? String(d.categorySlug) : undefined,
            location: String(d.location ?? ""),
            captureDate: String(d.captureDate ?? ""),
            featured: Boolean(d.featured),
            published: Boolean(d.published),
            displayOrder: Number(d.displayOrder ?? 0),
            width: typeof d.width === "number" ? d.width : undefined,
            height: typeof d.height === "number" ? d.height : undefined,
            cameraSpec: d.cameraSpec ? String(d.cameraSpec) : undefined,
            createdAt: serializeTimestamp(d.createdAt),
          };
        });
      }
    } catch {
      // Fallback below when indexes or DB are not provisioned yet
    }
  }

  if (!loadedFromDb && allowFallback) {
    items = [...INITIAL_GALLERY_IMAGES];
    if (!includeUnpublished) {
      items = items.filter((img) => img.published);
    }
    if (categoryId) {
      items = items.filter((img) => img.categoryId === categoryId);
    }
    if (featuredOnly) {
      items = items.filter((img) => img.featured);
    }
  }

  if (categorySlug && categorySlug !== "all") {
    const categories = await getCategories();
    const matchedCat = categories.find((c) => c.slug === categorySlug);
    items = items.filter(
      (img) =>
        img.categorySlug === categorySlug ||
        (matchedCat && img.categoryId === matchedCat.id)
    );
  }

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    items = items.filter(
      (img) =>
        img.title.toLowerCase().includes(q) ||
        img.description.toLowerCase().includes(q) ||
        img.location.toLowerCase().includes(q) ||
        (img.categoryName?.toLowerCase().includes(q) ?? false)
    );
  }

  const total = items.length;
  const sliced =
    typeof limitCount === "number"
      ? items.slice(offset, offset + limitCount)
      : items.slice(offset);

  return { items: sliced, total };
}

export async function getStories(options?: {
  includeUnpublished?: boolean;
  allowFallback?: boolean;
}): Promise<Story[]> {
  const { includeUnpublished = false, allowFallback = true } = options ?? {};
  const db = getAdminDb();

  if (db) {
    try {
      let query: FirebaseFirestore.Query = db.collection("stories");
      if (!includeUnpublished) {
        query = query.where("published", "==", true);
      }
      const snap = await query.orderBy("createdAt", "desc").get();
      if (!snap.empty || !allowFallback) {
        return snap.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            title: String(d.title ?? ""),
            slug: String(d.slug ?? ""),
            description: String(d.description ?? ""),
            coverImage: String(d.coverImage ?? ""),
            content: String(d.content ?? ""),
            location: d.location ? String(d.location) : undefined,
            captureDate: d.captureDate ? String(d.captureDate) : undefined,
            galleryImages: Array.isArray(d.galleryImages)
              ? d.galleryImages
              : [],
            published: Boolean(d.published),
            createdAt: serializeTimestamp(d.createdAt),
          };
        });
      }
    } catch {
      // Fallback if collection/index not initialized yet
    }
  }

  if (!allowFallback) return [];
  return includeUnpublished
    ? INITIAL_STORIES
    : INITIAL_STORIES.filter((s) => s.published);
}

export async function getStoryBySlug(
  slug: string,
  includeUnpublished = false
): Promise<Story | null> {
  const stories = await getStories({ includeUnpublished });
  return stories.find((s) => s.slug === slug) ?? null;
}

export async function getTestimonials(options?: {
  includePending?: boolean;
}): Promise<Testimonial[]> {
  // Never invent fake testimonials. Only return genuine records stored in Firestore.
  const { includePending = false } = options ?? {};
  const db = getAdminDb();
  if (!db) return [];

  try {
    let query: FirebaseFirestore.Query = db.collection("testimonials");
    if (!includePending) {
      query = query.where("approved", "==", true);
    }
    const snap = await query.orderBy("createdAt", "desc").get();
    return snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        customerName: String(d.customerName ?? ""),
        message: String(d.message ?? ""),
        rating: Number(d.rating ?? 5),
        customerPhotoUrl: d.customerPhotoUrl
          ? String(d.customerPhotoUrl)
          : undefined,
        serviceType: d.serviceType ? String(d.serviceType) : undefined,
        approved: Boolean(d.approved),
        createdAt: serializeTimestamp(d.createdAt),
      };
    });
  } catch {
    return [];
  }
}

export async function getBookings(options?: {
  status?: BookingStatus | "All";
}): Promise<Booking[]> {
  const db = getAdminDb();
  if (!db) return [];

  try {
    let query: FirebaseFirestore.Query = db.collection("bookings");
    if (options?.status && options.status !== "All") {
      query = query.where("status", "==", options.status);
    }
    const snap = await query.orderBy("createdAt", "desc").get();
    return snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        customerName: String(d.customerName ?? ""),
        email: String(d.email ?? ""),
        phone: String(d.phone ?? ""),
        serviceType: String(d.serviceType ?? ""),
        preferredDate: String(d.preferredDate ?? ""),
        location: String(d.location ?? ""),
        message: String(d.message ?? ""),
        status: (d.status as BookingStatus) ?? "Pending",
        createdAt: serializeTimestamp(d.createdAt),
        updatedAt: d.updatedAt ? serializeTimestamp(d.updatedAt) : undefined,
      };
    });
  } catch {
    return [];
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const db = getAdminDb();
  if (db) {
    try {
      const doc = await db.collection("site_settings").doc("main").get();
      if (doc.exists) {
        const d = doc.data()!;
        return {
          id: doc.id,
          brandName: String(d.brandName ?? DEFAULT_SITE_SETTINGS.brandName),
          tagline: String(d.tagline ?? DEFAULT_SITE_SETTINGS.tagline),
          supportingText: String(
            d.supportingText ?? DEFAULT_SITE_SETTINGS.supportingText
          ),
          heroImageUrl: d.heroImageUrl ? String(d.heroImageUrl) : "",
          aboutImageUrl: d.aboutImageUrl ? String(d.aboutImageUrl) : "",
          photographerName: String(
            d.photographerName ?? DEFAULT_SITE_SETTINGS.photographerName
          ),
          aboutHeadline: String(
            d.aboutHeadline ?? DEFAULT_SITE_SETTINGS.aboutHeadline
          ),
          aboutBio: String(d.aboutBio ?? DEFAULT_SITE_SETTINGS.aboutBio),
          email: String(d.email ?? DEFAULT_SITE_SETTINGS.email),
          phone: String(d.phone ?? DEFAULT_SITE_SETTINGS.phone),
          studioAddress: String(
            d.studioAddress ?? DEFAULT_SITE_SETTINGS.studioAddress
          ),
          instagramUrl: String(
            d.instagramUrl ?? DEFAULT_SITE_SETTINGS.instagramUrl
          ),
          facebookUrl: String(
            d.facebookUrl ?? DEFAULT_SITE_SETTINGS.facebookUrl
          ),
          services:
            Array.isArray(d.services) && d.services.length > 0
              ? d.services
              : DEFAULT_SITE_SETTINGS.services,
          updatedAt: serializeTimestamp(d.updatedAt),
        };
      }
    } catch {
      // Fallback below
    }
  }
  return DEFAULT_SITE_SETTINGS;
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const [gallery, categories, bookings, stories, testimonials] =
    await Promise.all([
      getGalleryImages({ includeUnpublished: true, allowFallback: false }),
      getCategories({ allowFallback: false }),
      getBookings(),
      getStories({ includeUnpublished: true, allowFallback: false }),
      getTestimonials({ includePending: true }),
    ]);

  return {
    totalPhotographs: gallery.total,
    publishedPhotographs: gallery.items.filter((i) => i.published).length,
    totalCategories: categories.length,
    totalBookings: bookings.length,
    pendingBookings: bookings.filter((b) => b.status === "Pending").length,
    publishedStories: stories.filter((s) => s.published).length,
    totalStories: stories.length,
    pendingTestimonials: testimonials.filter((t) => !t.approved).length,
    approvedTestimonials: testimonials.filter((t) => t.approved).length,
  };
}

