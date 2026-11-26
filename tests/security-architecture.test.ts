import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import {
  DEFAULT_SERVICES,
  DEFAULT_SITE_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_GALLERY_IMAGES,
  INITIAL_STORIES,
} from "../src/lib/studio-catalog";

describe("Security Rules & Studio Catalog Integrity", () => {
  it("includes all 10 required photography categories ready for photographer uploads", () => {
    const slugs = INITIAL_CATEGORIES.map((c) => c.slug);
    expect(slugs).toEqual([
      "wedding",
      "portrait",
      "nature",
      "landscape",
      "travel",
      "fashion",
      "events",
      "street",
      "product",
      "wildlife",
    ]);

    for (const cat of INITIAL_CATEGORIES) {
      expect(cat.coverImage).toBe("");
    }
  });

  it("includes all 7 required services with no invented hardcoded pricing", () => {
    expect(DEFAULT_SERVICES).toHaveLength(7);
    for (const service of DEFAULT_SERVICES) {
      expect(service.startingPrice).toBeUndefined();
    }
    expect(DEFAULT_SITE_SETTINGS.brandName).toBe("MJ PHOTOGRAPHY");
    expect(DEFAULT_SITE_SETTINGS.tagline).toBe("EVERY FRAME TELLS A STORY.");
  });

  it("ensures pre-loaded sample photography has been removed", () => {
    expect(INITIAL_GALLERY_IMAGES).toEqual([]);
    expect(INITIAL_STORIES).toEqual([]);

    const imagesDir = path.resolve(process.cwd(), "public", "images");
    const entries = fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir) : [];
    expect(entries).toEqual([]);
  });

  it("enforces strict Firestore & Storage security rules", () => {
    const firestoreRules = fs.readFileSync(
      path.resolve(process.cwd(), "firestore.rules"),
      "utf-8"
    );
    const storageRules = fs.readFileSync(
      path.resolve(process.cwd(), "storage.rules"),
      "utf-8"
    );

    expect(firestoreRules).toContain("match /bookings/{bookingId}");
    expect(firestoreRules).toContain("allow read, write: if isAdmin()");
    expect(firestoreRules).toContain(
      "allow read: if resource.data.published == true || isAdmin()"
    );
    expect(firestoreRules).toContain(
      "allow read: if resource.data.approved == true || isAdmin()"
    );
    expect(firestoreRules).toContain("request.resource.data.role == 'customer'");

    expect(storageRules).toContain("match /gallery/{allPaths=**}");
    expect(storageRules).toContain("match /thumbnails/{allPaths=**}");
    expect(storageRules).toContain("match /categories/{allPaths=**}");
    expect(storageRules).toContain("match /stories/{allPaths=**}");
    expect(storageRules).toContain("50 * 1024 * 1024");
  });
});
