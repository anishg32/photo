import { describe, it, expect } from "vitest";
import { checkRateLimit } from "../src/lib/rate-limit";

describe("API Rate Limiter", () => {
  it("allows up to maxRequests and blocks subsequent requests within window", () => {
    const key = `test-ip-${Date.now()}`;
    expect(checkRateLimit(key, 3, 60_000).allowed).toBe(true);
    expect(checkRateLimit(key, 3, 60_000).allowed).toBe(true);
    const third = checkRateLimit(key, 3, 60_000);
    expect(third.allowed).toBe(true);
    expect(third.remaining).toBe(0);

    const fourth = checkRateLimit(key, 3, 60_000);
    expect(fourth.allowed).toBe(false);
    expect(fourth.retryAfterSeconds).toBeGreaterThanOrEqual(1);
  });

  it("isolates buckets across independent keys", () => {
    const k1 = `ip-a-${Date.now()}`;
    const k2 = `ip-b-${Date.now()}`;
    checkRateLimit(k1, 1, 60_000);
    expect(checkRateLimit(k1, 1, 60_000).allowed).toBe(false);
    expect(checkRateLimit(k2, 1, 60_000).allowed).toBe(true);
  });
});

