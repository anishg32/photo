import { describe, it, expect, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { NextRequest } from "next/server";
import { proxy } from "../src/proxy";
import { POST as submitBooking } from "../src/app/api/bookings/route";
import { GET as getPublicGallery } from "../src/app/api/gallery/route";
import { GET as getAdminOverview } from "../src/app/api/admin/overview/route";
import { GET as getAdminBookings } from "../src/app/api/admin/bookings/route";
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

  it("rejects unauthenticated requests to admin endpoints with 401", async () => {
    const ovReq = new Request("http://localhost:3000/api/admin/overview");
    const ovRes = await getAdminOverview(ovReq);
    expect(ovRes.status).toBe(401);

    const bkReq = new Request("http://localhost:3000/api/admin/bookings");
    const bkRes = await getAdminBookings(bkReq);
    expect(bkRes.status).toBe(401);
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

  it("serves empty gallery cleanly from GET /api/gallery before uploads", async () => {
    const req = new Request("http://localhost:3000/api/gallery?category=wedding");
    const res = await getPublicGallery(req);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { items: unknown[]; total: number };
    expect(Array.isArray(json.items)).toBe(true);
    expect(json.total).toBe(0);
  });
});
