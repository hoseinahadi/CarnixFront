export interface SearchSuggestion {
  id: string | number;
  title: string;  
  slug: string;
  partNumber?: string;
  thumbnailUrl?: string;  
  type: 'product' | 'category' | 'brand';
}