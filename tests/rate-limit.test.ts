import { describe, it, expect } from "vitest";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("permite hasta el límite y luego bloquea", () => {
    const key = `test:${Math.round(performance.now())}:a`;
    for (let i = 0; i < 3; i++) {
      expect(rateLimit(key, 3, 60_000).ok).toBe(true);
    }
    const blocked = rateLimit(key, 3, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("cuenta llaves distintas por separado", () => {
    const base = `test:${Math.round(performance.now())}:b`;
    expect(rateLimit(`${base}:1`, 1, 60_000).ok).toBe(true);
    expect(rateLimit(`${base}:2`, 1, 60_000).ok).toBe(true);
  });
});

describe("getClientIp", () => {
  it("toma la primera IP de x-forwarded-for", () => {
    const req = new Request("https://x", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("devuelve 'unknown' sin cabeceras", () => {
    expect(getClientIp(new Request("https://x"))).toBe("unknown");
  });
});
