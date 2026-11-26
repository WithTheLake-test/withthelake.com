// Small cache for the live feeds: Cloudflare's Cache API when available, plus memory in the same worker.
// Keys are fixed names; no secret ever goes into a key.

type Entry<T> = { value: T; at: number };

const memory = new Map<string, Entry<unknown>>();

function edgeCache(): Cache | undefined {
  return (globalThis as unknown as { caches?: { default?: Cache } }).caches?.default;
}

export async function cached<T>(key: string, ttlMs: number, fresh: boolean, load: () => Promise<T>): Promise<Entry<T>> {
  const now = Date.now();
  const request = new Request(`https://backoffice-cache.invalid/${key}`);
  if (!fresh) {
    const hit = memory.get(key) as Entry<T> | undefined;
    if (hit && now - hit.at < ttlMs) return hit;
    const stored = await edgeCache()?.match(request).catch(() => undefined);
    if (stored) {
      const entry = (await stored.json()) as Entry<T>;
      if (now - entry.at < ttlMs) {
        memory.set(key, entry);
        return entry;
      }
    }
  }
  const entry: Entry<T> = { value: await load(), at: now };
  memory.set(key, entry);
  await edgeCache()
    ?.put(request, new Response(JSON.stringify(entry), { headers: { "Cache-Control": `max-age=${Math.round(ttlMs / 1000)}` } }))
    .catch(() => undefined);
  return entry;
}
