import { describe, it, expect, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { NextRequest } from "next/server";
import { proxy } from "../src/proxy";
import { POST as submitBooking } from "../src/app/api/bookings/route";
import { GET as getPublicGallery } from "../src/app/api/gallery/route";
import { GET as getAdminOverview } from "../src/app/api/admin/overview/route";
import { GET as getAdminBookings } from "../src/app/api/admin/bookings/route";
import { PATCH as patchAdminGallery, POST as postAdminGallery } from "../src/app/api/admin/gallery/route";
import { PATCH as patchAdminCategories } from "../src/app/api/admin/categories/route";
import { PATCH as patchAdminStories, POST as postAdminStories } from "../src/app/api/admin/stories/route";
import { PATCH as patchAdminSettings, PUT as putAdminSettings } from "../src/app/api/admin/settings/route";
import { POST as seedAdminCatalog } from "../src/app/api/admin/seed/route";
import { POST as uploadAdminImage } from "../src/app/api/admin/upload/route";
import { POST as createSession } from "../src/app/api/auth/session/route";

describe("Route Handlers & Proxy Security", () => {
  it("redirects unauthenticated /admin requests to /admin/login in proxy", () => {
    const req = new NextRequest("http://localhost:3000/admin");
    const res = proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/admin/login");
  });

  it("allows /admin/login without session cookie and attaches security headers", () => {
    const req = new NextRequest("http://localhost:3000/admin/login");
    const res = proxy(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("rejects unauthenticated requests to admin read, add, and replace endpoints with 401", async () => {
    const ovReq = new Request("http://localhost:3000/api/admin/overview");
    expect((await getAdminOverview(ovReq)).status).toBe(401);

    const bkReq = new Request("http://localhost:3000/api/admin/bookings");
    expect((await getAdminBookings(bkReq)).status).toBe(401);

    const addReq = new Request("http://localhost:3000/api/admin/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Unauthorized Add" }),
    });
    expect((await postAdminGallery(addReq)).status).toBe(401);

    const replaceReq = new Request("http://localhost:3000/api/admin/gallery", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "img-1", imageUrl: "https://evil.invalid/x.jpg" }),
    });
    expect((await patchAdminGallery(replaceReq)).status).toBe(401);

    const replaceCatReq = new Request("http://localhost:3000/api/admin/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "cat-wedding", coverImage: "https://evil.invalid/x.jpg" }),
    });
    expect((await patchAdminCategories(replaceCatReq)).status).toBe(401);

    const uploadReq = new Request("http://localhost:3000/api/admin/upload", {
      method: "POST",
    });
    expect((await uploadAdminImage(uploadReq)).status).toBe(401);

    const addStoryReq = new Request("http://localhost:3000/api/admin/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Unauthorized Story" }),
    });
    expect((await postAdminStories(addStoryReq)).status).toBe(401);

    const replaceStoryReq = new Request("http://localhost:3000/api/admin/stories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "story-1", coverImage: "https://evil.invalid/x.jpg" }),
    });
    expect((await patchAdminStories(replaceStoryReq)).status).toBe(401);

    const replaceSettingsReq = new Request("http://localhost:3000/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heroImageUrl: "https://evil.invalid/hero.jpg" }),
    });
    expect((await patchAdminSettings(replaceSettingsReq)).status).toBe(401);

    const putSettingsReq = new Request("http://localhost:3000/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect((await putAdminSettings(putSettingsReq)).status).toBe(401);

    const seedReq = new Request("http://localhost:3000/api/admin/seed", {
      method: "POST",
    });
    expect((await seedAdminCatalog(seedReq)).status).toBe(401);
  });

  it("rejects missing Firebase ID token on /api/auth/session", async () => {
    const req = new Request("http://localhost:3000/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await createSession(req);
    expect(res.status).toBe(400);
  });

  it("validates public booking input and returns honest 503 when Firebase Admin is unconfigured", async () => {
    const badReq = new Request("http://localhost:3000/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.1" },
      body: JSON.stringify({ customerName: "A", email: "bad" }),
    });
    const badRes = await submitBooking(badReq);
    expect(badRes.status).toBe(400);

    const validReq = new Request("http://localhost:3000/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.2" },
      body: JSON.stringify({
        customerName: "Elena Vance",
        email: "elena@example.com",
        phone: "+1 212 555 0144",
        serviceType: "Wedding Photography",
        preferredDate: "2027-06-15",
        location: "Lake Como, Italy",
        message: "Three-day destination celebration with twilight portraits.",
      }),
    });
    const validRes = await submitBooking(validReq);
    expect(validRes.status).toBe(503);
  });

  it("serves filtered gallery plates from GET /api/gallery", async () => {
    const req = new Request("http://localhost:3000/api/gallery?category=wedding");
    const res = await getPublicGallery(req);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { items: Array<{ categorySlug: string }> };
    expect(json.items.length).toBeGreaterThan(0);
    expect(json.items.every((i) => i.categorySlug === "wedding")).toBe(true);
  });
});
