import { describe, it, expect } from "vitest";
import {
  bookingCreateSchema,
  testimonialCreateSchema,
  categorySchema,
  galleryImageSchema,
  storySchema,
  validateImageFileMeta,
  MAX_IMAGE_UPLOAD_BYTES,
  slugify,
} from "../src/lib/validation";

describe("Validation Schemas", () => {
  it("accepts a valid photography booking enquiry", () => {
    const res = bookingCreateSchema.safeParse({
      customerName: "Elena Vance",
      email: "elena@example.com",
      phone: "+1 212 555 0144",
      serviceType: "Wedding Photography",
      preferredDate: "2027-06-15",
      location: "Lake Como, Italy",
      message: "Three-day destination celebration with twilight portraits.",
      website: "",
    });
    expect(res.success).toBe(true);
  });

  it("rejects bot honeypot submissions and malformed emails", () => {
    const bot = bookingCreateSchema.safeParse({
      customerName: "Spam Bot",
      email: "bot@example.com",
      phone: "1234567",
      serviceType: "Wedding Photography",
      preferredDate: "2027-06-15",
      location: "Paris",
      message: "Automated spam inquiry content here.",
      website: "https://spam.invalid",
    });
    expect(bot.success).toBe(false);

    const badEmail = bookingCreateSchema.safeParse({
      customerName: "Julian Sterling",
      email: "not-an-email",
      phone: "1234567",
      serviceType: "Portrait Photography",
      preferredDate: "2027-01-20",
      location: "New York",
      message: "Portrait sitting request for autumn publication.",
    });
    expect(badEmail.success).toBe(false);
  });

  it("validates testimonials and enforces 1-5 rating range", () => {
    expect(
      testimonialCreateSchema.safeParse({
        customerName: "Sophia Laurent",
        message: "Every frame captured our twilight celebration effortlessly.",
        rating: 5,
      }).success
    ).toBe(true);

    expect(
      testimonialCreateSchema.safeParse({
        customerName: "Sophia Laurent",
        message: "Every frame captured our twilight celebration effortlessly.",
        rating: 6,
      }).success
    ).toBe(false);
  });

  it("validates category, gallery image, and story payloads", () => {
    expect(
      categorySchema.safeParse({
        name: "Street Photography",
        slug: "street",
        description: "Nocturnal city frames captured with Leica prime optics.",
        coverImage: "/images/categories/street.jpg",
        displayOrder: 8,
      }).success
    ).toBe(true);

    expect(
      galleryImageSchema.safeParse({
        title: "Ginza Rain Study",
        description: "Nocturnal reflection through rain-beaded glass.",
        imageUrl: "/images/gallery/tokyo-rain.jpg",
        thumbnailUrl: "/images/gallery/tokyo-rain.jpg",
        categoryId: "cat-street",
        location: "Tokyo, Japan",
        captureDate: "2026-10-08",
        featured: true,
        published: true,
        displayOrder: 1,
      }).success
    ).toBe(true);

    expect(
      storySchema.safeParse({
        title: "Kyoto After Rain",
        slug: "kyoto-after-rain",
        description: "Walking wet temple stone paths illuminated by lanterns.",
        coverImage: "/images/stories/kyoto-nocturne.jpg",
        content:
          "Rain turns every ancient stone stair into a quiet amber mirror throughout Higashiyama.",
        published: true,
      }).success
    ).toBe(true);
  });

  it("validates photography upload MIME types and 50MB size limit", () => {
    expect(validateImageFileMeta("image/jpeg", 1024 * 500).valid).toBe(true);
    expect(validateImageFileMeta("image/tiff", 1024 * 1024 * 25).valid).toBe(true);
    expect(validateImageFileMeta("application/pdf", 1024).valid).toBe(false);
    expect(
      validateImageFileMeta("image/png", MAX_IMAGE_UPLOAD_BYTES + 1).valid
    ).toBe(false);
    expect(validateImageFileMeta("image/jpeg", 0).valid).toBe(false);
  });

  it("normalizes slugs cleanly", () => {
    expect(slugify("Wedding & Portrait Photography!")).toBe(
      "wedding-portrait-photography"
    );
  });
});

