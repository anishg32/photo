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
  it("includes all 10 required photography categories with unique cover images", () => {
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

    const uniqueCovers = new Set(INITIAL_CATEGORIES.map((c) => c.coverImage));
    expect(uniqueCovers.size).toBe(10);
  });

  it("includes all 7 required services with no invented hardcoded pricing", () => {
    expect(DEFAULT_SERVICES).toHaveLength(7);
    for (const service of DEFAULT_SERVICES) {
      expect(service.startingPrice).toBeUndefined();
    }
    expect(DEFAULT_SITE_SETTINGS.brandName).toBe("MJ PHOTOGRAPHY");
    expect(DEFAULT_SITE_SETTINGS.tagline).toBe("EVERY FRAME TELLS A STORY.");
    expect(DEFAULT_SITE_SETTINGS.email).toBe("vishnumj112004@gmail.com");
    expect(DEFAULT_SITE_SETTINGS.phone).toBe("+91 98841 53308");
  });

  it("verifies every referenced local sample photograph exists in public/", () => {
    const publicDir = path.resolve(process.cwd(), "public");
    const pathsToCheck = [
      DEFAULT_SITE_SETTINGS.heroImageUrl || "",
      DEFAULT_SITE_SETTINGS.aboutImageUrl || "",
      ...INITIAL_CATEGORIES.map((c) => c.coverImage),
      ...INITIAL_GALLERY_IMAGES.map((i) => i.imageUrl),
      ...INITIAL_STORIES.map((s) => s.coverImage),
    ].filter(Boolean);

    expect(pathsToCheck.length).toBeGreaterThan(20);
    for (const rel of pathsToCheck) {
      const fullPath = path.join(publicDir, rel.replace(/^\//, ""));
      expect(fs.existsSync(fullPath), `Missing image asset: ${rel}`).toBe(true);
      const stat = fs.statSync(fullPath);
      expect(stat.size).toBeGreaterThan(20_000);
    }
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

    const gitignore = fs.readFileSync(
      path.resolve(process.cwd(), ".gitignore"),
      "utf-8"
    );
    expect(gitignore).toContain("serviceAccountKey.json");
    expect(gitignore).toContain("*firebase-adminsdk*.json");
  });

  it("prevents native HTTP POST 405 on client login and booking forms before hydration", () => {
    const loginSource = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/admin/AdminLoginClient.tsx"),
      "utf-8"
    );
    const bookingSource = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/forms/BookingForm.tsx"),
      "utf-8"
    );

    expect(loginSource).not.toMatch(/method=["']POST["']/i);
    expect(loginSource).toContain('type={hydrated ? "submit" : "button"}');
    expect(bookingSource).not.toMatch(/method=["']POST["']/i);
    expect(bookingSource).toContain('type={hydrated ? "submit" : "button"}');
  });
});
