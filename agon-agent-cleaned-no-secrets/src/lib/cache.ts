/**
 * Thin fetch wrapper — NO caching.
 * All API data is always fetched fresh so admin changes appear immediately.
 * Cache-busting timestamp is appended to prevent browser/CDN stale reads.
 */
export async function cachedFetch<T>(url: string, _ttlMs = 0): Promise<T> {
  // Append cache-bust param so browser never serves a stale response
  const sep = url.includes('?') ? '&' : '?';
  const bustUrl = `${url}${sep}_t=${Date.now()}`;
  const res = await fetch(bustUrl, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json() as Promise<T>;
}

// Keep these as no-ops so existing imports don't break
export function setCache<T>(_key: string, _data: T, _ttlMs = 0) {}
export function getCache<T>(_key: string): T | null { return null; }
export function invalidateCache(_prefix: string) {}
