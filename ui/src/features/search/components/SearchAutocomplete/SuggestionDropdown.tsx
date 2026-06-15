import { SearchSuggestion } from "@/models/search/SearchSuggestion";

let abortController: AbortController | null = null;

export const fetchSuggestions = async (query: string): Promise<SearchSuggestion[]> => {
  if (abortController) {
    abortController.abort();
  }
  abortController = new AbortController();

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const url = `${baseUrl}/search/suggestions?q=${encodeURIComponent(query)}&limit=5`;

  try {
    const res = await fetch(url, {
      signal: abortController.signal,
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: SearchSuggestion[] = await res.json();
    return data;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return [];
    }
    console.error('fetchSuggestions error:', err);
    return [];
  }
};
