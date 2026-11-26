import { z } from "zod";

export const BOOKING_STATUSES = [
  "Pending",
  "Contacted",
  "Confirmed",
  "Completed",
  "Cancelled",
] as const;

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/tiff",
] as const;

export const MAX_IMAGE_UPLOAD_BYTES = 50 * 1024 * 1024; // 50 MB raw photography preservation

export const bookingCreateSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Please provide your full name (at least 2 characters).")
    .max(120, "Full name cannot exceed 120 characters."),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address (e.g., you@example.com).")
    .max(180),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid contact phone number.")
    .max(32, "Phone number is too long.")
    .regex(/^[+\d\s().-]+$/, "Phone number contains invalid characters."),
  serviceType: z
    .string()
    .trim()
    .min(2, "Please select a photography service.")
    .max(100),
  preferredDate: z
    .string()
    .trim()
    .min(4, "Please specify your preferred date.")
    .max(40),
  location: z
    .string()
    .trim()
    .min(2, "Please share the event or session location.")
    .max(180),
  message: z
    .string()
    .trim()
    .min(10, "Please share at least a brief note about your vision (10+ characters).")
    .max(3000, "Message cannot exceed 3,000 characters."),
  // Honeypot trap for bots (must remain empty)
  website: z.string().max(0).optional(),
});

export const bookingStatusUpdateSchema = z.object({
  id: z.string().trim().min(1),
  status: z.enum(BOOKING_STATUSES),
});

export const testimonialCreateSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Please enter your name.")
    .max(100),
  message: z
    .string()
    .trim()
    .min(12, "Please share at least 12 characters of feedback.")
    .max(1200),
  rating: z.coerce.number().int().min(1).max(5),
  serviceType: z.string().trim().max(80).optional().default(""),
  customerPhotoUrl: z
    .string()
    .trim()
    .url("Must be a valid image URL.")
    .optional()
    .or(z.literal("")),
  website: z.string().max(0).optional(),
});

export const testimonialModerationSchema = z.object({
  id: z.string().trim().min(1),
  approved: z.boolean(),
});

export const categorySchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug must contain lowercase letters, numbers, and hyphens."),
  description: z.string().trim().min(10).max(500),
  coverImage: z.string().trim().optional().default(""),
  displayOrder: z.coerce.number().int().min(0).max(999).default(0),
});

export const galleryImageSchema = z.object({
  id: z.string().trim().optional(),
  title: z.string().trim().min(2).max(140),
  description: z.string().trim().min(4).max(800),
  imageUrl: z.string().trim().min(1),
  thumbnailUrl: z.string().trim().min(1),
  categoryId: z.string().trim().min(1),
  categoryName: z.string().trim().optional(),
  categorySlug: z.string().trim().optional(),
  location: z.string().trim().min(2).max(140),
  captureDate: z.string().trim().min(2).max(40),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0),
  width: z.coerce.number().int().positive().optional(),
  height: z.coerce.number().int().positive().optional(),
  cameraSpec: z.string().trim().max(120).optional(),
});

export const storySchema = z.object({
  id: z.string().trim().optional(),
  title: z.string().trim().min(3).max(160),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug must contain lowercase letters, numbers, and hyphens."),
  description: z.string().trim().min(10).max(600),
  coverImage: z.string().trim().min(1),
  content: z.string().trim().min(30).max(30000),
  location: z.string().trim().max(120).optional(),
  captureDate: z.string().trim().max(60).optional(),
  galleryImages: z
    .array(
      z.object({
        url: z.string().trim().min(1),
        caption: z.string().trim().max(300).optional(),
        aspect: z.enum(["landscape", "portrait", "square"]).optional(),
      })
    )
    .optional(),
  published: z.boolean().default(false),
});

export const studioServiceSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(100),
  description: z.string().trim().min(10).max(800),
  categorySlug: z.string().trim().min(1),
  pricingNote: z.string().trim().max(160).optional().default(""),
  startingPrice: z.string().trim().max(80).optional().default(""),
  deliverables: z.array(z.string().trim().max(160)).optional().default([]),
});

export const siteSettingsSchema = z.object({
  brandName: z.string().trim().min(2).max(80),
  tagline: z.string().trim().min(2).max(160),
  supportingText: z.string().trim().min(2).max(260),
  heroImageUrl: z.string().trim().optional().default(""),
  aboutImageUrl: z.string().trim().optional().default(""),
  photographerName: z.string().trim().min(2).max(100),
  aboutHeadline: z.string().trim().min(5).max(160),
  aboutBio: z.string().trim().min(20).max(3000),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().min(5).max(40),
  studioAddress: z.string().trim().min(4).max(240),
  instagramUrl: z.string().trim().url().or(z.literal("")),
  facebookUrl: z.string().trim().url().or(z.literal("")),
  services: z.array(studioServiceSchema).min(1),
});

export function validateImageFileMeta(mimeType: string, sizeBytes: number) {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    return {
      valid: false as const,
      error: `Unsupported image type (${mimeType}). Allowed formats: JPEG, PNG, WebP, AVIF, TIFF.`,
    };
  }
  if (sizeBytes <= 0 || sizeBytes > MAX_IMAGE_UPLOAD_BYTES) {
    return {
      valid: false as const,
      error: "Image file size must be between 1 byte and 50 MB.",
    };
  }
  return { valid: true as const };
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

