export interface CatalogVersion {
  version: string;
  updatedAt: string;
}

export interface DashboardViews {
  total: number;
  today: number;
  thisWeek: number;
}

export interface DashboardStats {
  totalStories: number;
  publishedStories: number;
  draftStories: number;
  featuredStories: number;
  totalCategories: number;
  publishedCategories: number;
  views: DashboardViews;
  catalogVersion: CatalogVersion;
  lastPublishedAt?: string;
}
