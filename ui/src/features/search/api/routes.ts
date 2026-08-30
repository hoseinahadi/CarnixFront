import type { SearchSuggestion } from '@/models/search/SearchSuggestion';
import axiosClient from '@/services/api/common/axiosClient';

const SEARCH_CACHE_TTL_MS = 60_000;
const MAX_SEARCH_CACHE_ENTRIES = 50;

const suggestionCache = new Map<
  string,
  { expiresAt: number; items: SearchSuggestion[] }
>();

const pruneSuggestionCache = (): void => {
  const now = Date.now();
  for (const [key, value] of suggestionCache) {
    if (value.expiresAt <= now) suggestionCache.delete(key);
  }

  while (suggestionCache.size > MAX_SEARCH_CACHE_ENTRIES) {
    const firstKey = suggestionCache.keys().next().value as string | undefined;
    if (!firstKey) break;
    suggestionCache.delete(firstKey);
  }
};

export const searchApi = {
  getSuggestions: async (
    query: string,
    signal?: AbortSignal,
    limit: number = 5,
  ): Promise<SearchSuggestion[]> => {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 3) return [];

    pruneSuggestionCache();
    const cacheKey = `${normalizedQuery.toLocaleLowerCase('fa-IR')}:${limit}`;
    const cached = suggestionCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.items;
    }

    const response = await axiosClient.get<SearchSuggestion[]>(
      '/search/suggestions',
      {
        params: { q: normalizedQuery, limit },
        signal,
      },
    );

    const items = Array.isArray(response.data) ? response.data : [];
    suggestionCache.set(cacheKey, {
      expiresAt: Date.now() + SEARCH_CACHE_TTL_MS,
      items,
    });

    return items;
  },
};
