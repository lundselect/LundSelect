// In-memory rate limiter.
// Works within a single serverless instance — good enough for a low-traffic API.
// Upgrade to Upstash Redis when traffic grows.

interface Entry {
  count: number
  resetAt: number
}

const store = new Map<string, Entry>()

// Clean up expired entries every 5 minutes to prevent memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    store.forEach((entry, key) => {
      if (entry.resetAt < now) store.delete(key)
    })
  }, 5 * 60 * 1000)
}

export function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfterMs: number } {
  const now = Date.now()
  const entry = store.get(identifier)

  if (!entry || entry.resetAt < now) {
    store.set(identifier, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfterMs: 0 }
  }

  if (entry.count >= limit) {
    return { ok: false, retryAfterMs: entry.resetAt - now }
  }

  entry.count++
  return { ok: true, retryAfterMs: 0 }
}
