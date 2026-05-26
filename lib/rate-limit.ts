// Einfacher In-Memory-Rate-Limiter.
// HINWEIS: Bei Serverless (z. B. Vercel) gilt der Speicher pro Instanz und
// wird nicht geteilt – das ist nur ein Basisschutz. Für große Nutzung später
// einen geteilten Speicher (z. B. Redis/Upstash) einsetzen.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: string;
};

export function checkRateLimit(
  key: string,
  options?: { limit?: number; windowMs?: number },
): RateLimitResult {
  const limit = options?.limit ?? 30;
  const windowMs = options?.windowMs ?? 60_000;
  const now = Date.now();

  const existing = buckets.get(key);
  if (!existing || now >= existing.resetAt) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt: new Date(resetAt).toISOString() };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(existing.resetAt).toISOString(),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, limit - existing.count),
    resetAt: new Date(existing.resetAt).toISOString(),
  };
}

// Bildet einen Rate-Limit-Key aus Request + Bezeichner. Es werden keine
// Secrets verwendet; bei fehlendem Bezeichner wird die IP herangezogen.
export function rateLimitKey(prefix: string, identifier: string | null, request: Request): string {
  if (identifier) return `${prefix}:${identifier}`;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return `${prefix}:ip:${ip}`;
}
