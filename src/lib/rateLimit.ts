/**
 * Simple in-memory sliding-window rate limiter (edge-compatible).
 * For production scale, swap the store with Upstash Redis or Vercel KV.
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

export function checkRateLimit(key: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > config.windowMs) {
    // New window
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: config.limit - 1, resetInMs: config.windowMs };
  }

  if (entry.count >= config.limit) {
    const resetInMs = config.windowMs - (now - entry.windowStart);
    return { allowed: false, remaining: 0, resetInMs };
  }

  entry.count += 1;
  store.set(key, entry);
  return { allowed: true, remaining: config.limit - entry.count, resetInMs: config.windowMs - (now - entry.windowStart) };
}

// Predefined configs
export const LOGIN_RATE_LIMIT: RateLimitConfig = { limit: 5, windowMs: 15 * 60 * 1000 }; // 5/15min
export const REGISTER_RATE_LIMIT: RateLimitConfig = { limit: 3, windowMs: 60 * 60 * 1000 }; // 3/hour
export const SUPPORT_RATE_LIMIT: RateLimitConfig = { limit: 3, windowMs: 60 * 60 * 1000 }; // 3/hour
