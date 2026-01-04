export type SortOption = 'price-low' | 'price-high' | 'title-asc' | 'title-desc' | 'none';

export interface ProductFilters {
  searchQuery: string;
  category: string;
  sortBy: SortOption;
}