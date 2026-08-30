/**
 * کش کوچک in-memory برای GETهای پرتکرار.
 *
 * اهداف:
 * - درخواست‌های هم‌زمان با یک key روی یک Promise مشترک dedupe شوند.
 * - نتیجه موفق برای TTL مشخص نگه داشته شود.
 * - با سقف تعداد entry از رشد بدون کنترل RAM جلوگیری شود.
 * - invalidate شدن یک key/prefix اجازه ندهد Promise قدیمی دوباره cache کهنه بسازد.
 */

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const responseCache = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();
const MAX_CACHE_ENTRIES = 100;

const pruneCache = (): void => {
  const now = Date.now();

  for (const [key, entry] of responseCache) {
    if (entry.expiresAt <= now) {
      responseCache.delete(key);
    }
  }

  while (responseCache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = responseCache.keys().next().value as string | undefined;
    if (!oldestKey) break;
    responseCache.delete(oldestKey);
  }
};

export const getCachedRequest = async <T>(
  key: string,
  request: () => Promise<T>,
  ttlMs: number,
): Promise<T> => {
  pruneCache();

  const cached = responseCache.get(key) as CacheEntry<T> | undefined;
  if (cached && cached.expiresAt > Date.now()) {
    // LRU سبک: entry خوانده‌شده به انتهای Map منتقل می‌شود.
    responseCache.delete(key);
    responseCache.set(key, cached);
    return cached.value;
  }

  const pending = inFlightRequests.get(key) as Promise<T> | undefined;
  if (pending) {
    return pending;
  }

  let requestPromise: Promise<T>;

  requestPromise = request()
    .then((value) => {
      /*
       * اگر بین شروع و پایان درخواست mutation باعث invalidate شده باشد،
       * inFlight entry حذف شده و پاسخ قدیمی دیگر cache نمی‌شود.
       */
      if (inFlightRequests.get(key) === requestPromise && ttlMs > 0) {
        responseCache.set(key, {
          value,
          expiresAt: Date.now() + ttlMs,
        });
        pruneCache();
      }

      return value;
    })
    .finally(() => {
      if (inFlightRequests.get(key) === requestPromise) {
        inFlightRequests.delete(key);
      }
    });

  inFlightRequests.set(key, requestPromise);
  return requestPromise;
};

/** فقط dedupe درخواست‌های هم‌زمان؛ بدون نگه‌داشتن response پس از پایان request. */
export const getDedupedRequest = <T>(
  key: string,
  request: () => Promise<T>,
): Promise<T> => getCachedRequest(key, request, 0);

export const invalidateRequestCache = (prefix?: string): void => {
  if (!prefix) {
    responseCache.clear();
    inFlightRequests.clear();
    return;
  }

  for (const key of Array.from(responseCache.keys())) {
    if (key.startsWith(prefix)) {
      responseCache.delete(key);
    }
  }

  /*
   * Promise شبکه قابل cancel عمومی نیست، اما حذف از Map باعث می‌شود:
   * 1) درخواست جدید بعد از mutation به Promise قدیمی وصل نشود.
   * 2) Promise قدیمی بعد از resolve نتواند cache stale ایجاد کند.
   */
  for (const key of Array.from(inFlightRequests.keys())) {
    if (key.startsWith(prefix)) {
      inFlightRequests.delete(key);
    }
  }
};
