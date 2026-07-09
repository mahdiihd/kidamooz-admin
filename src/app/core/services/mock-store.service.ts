import { Injectable, signal } from '@angular/core';
import { Category, CategoryPayload } from '../models/category.model';
import { CatalogVersion, DashboardStats } from '../models/catalog.model';
import { Story, StoryChapter, StoryDetail, StoryListResponse, StoryPayload } from '../models/story.model';
import { AuditAction, AuditEntityType, AuditLogEntry } from '../models/audit-log.model';
import { normalizeStoryAccess, StoryVisibility } from '../models/story-access.model';
import {
  MOCK_ADMIN,
  MOCK_AUDIT_LOGS,
  MOCK_CATALOG_VERSION,
  MOCK_CATEGORIES,
  MOCK_DASHBOARD_VIEWS,
  MOCK_STORIES,
} from '../data/mock-data';

export interface StoryQueryFilters {
  categoryId?: string;
  ageMin?: number;
  ageMax?: number;
  featured?: boolean;
  published?: boolean;
  visibility?: StoryVisibility;
  page?: number;
  limit?: number;
  sortBy?: 'sortOrder' | 'title' | 'publishedAt';
}

@Injectable({ providedIn: 'root' })
export class MockStore {
  private readonly categories = signal<Category[]>(structuredClone(MOCK_CATEGORIES));
  private readonly stories = signal<StoryDetail[]>(structuredClone(MOCK_STORIES));
  private readonly catalogVersion = signal<CatalogVersion>(structuredClone(MOCK_CATALOG_VERSION));
  private readonly auditLogs = signal<AuditLogEntry[]>(structuredClone(MOCK_AUDIT_LOGS));

  getCategories(): Category[] {
    return [...this.categories()].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  getCategory(id: string): Category | undefined {
    return this.categories().find((c) => c.id === id);
  }

  createCategory(payload: CategoryPayload): Category {
    const maxOrder = Math.max(0, ...this.categories().map((c) => c.sortOrder));
    const category: Category = {
      id: payload.id ?? payload.slug,
      title: payload.title,
      slug: payload.slug,
      iconUrl: payload.iconUrl,
      color: payload.color,
      sortOrder: payload.sortOrder ?? maxOrder + 1,
      published: payload.published,
    };
    this.categories.update((items) => [...items, category]);
    this.log('create', 'category', category.id, category.title.fa);
    return category;
  }

  updateCategory(id: string, payload: CategoryPayload): Category {
    const updated = this.categories().map((c) =>
      c.id === id
        ? {
            ...c,
            title: payload.title,
            slug: payload.slug,
            iconUrl: payload.iconUrl,
            color: payload.color,
            sortOrder: payload.sortOrder,
            published: payload.published,
          }
        : c,
    );
    this.categories.set(updated);
    const category = updated.find((c) => c.id === id)!;
    this.log('update', 'category', category.id, category.title.fa);
    if (category.published) {
      this.bumpCatalogVersion();
    }
    return category;
  }

  deleteCategory(id: string): void {
    const category = this.getCategory(id);
    this.categories.update((items) => items.filter((c) => c.id !== id));
    if (category) {
      this.log('delete', 'category', category.id, category.title.fa);
    }
    if (category?.published) {
      this.bumpCatalogVersion();
    }
  }

  publishCategory(id: string, published: boolean): Category {
    const updated = this.categories().map((c) => (c.id === id ? { ...c, published } : c));
    this.categories.set(updated);
    const category = updated.find((c) => c.id === id)!;
    this.log(published ? 'publish' : 'unpublish', 'category', category.id, category.title.fa);
    this.bumpCatalogVersion();
    return category;
  }

  reorderCategories(ids: string[]): Category[] {
    const map = new Map(this.categories().map((c) => [c.id, c]));
    const reordered = ids
      .map((id, index) => {
        const cat = map.get(id);
        return cat ? { ...cat, sortOrder: index + 1 } : null;
      })
      .filter((c): c is Category => c !== null);
    const remaining = this.categories().filter((c) => !ids.includes(c.id));
    this.categories.set([...reordered, ...remaining]);
    this.log('reorder', 'category', 'all', 'مرتب‌سازی دسته‌ها');
    this.bumpCatalogVersion();
    return this.getCategories();
  }

  getStories(filters?: StoryQueryFilters): StoryListResponse {
    let items = [...this.stories()];

    if (filters?.categoryId) {
      items = items.filter((s) => s.categoryId === filters.categoryId);
    }
    if (filters?.ageMin !== undefined && filters.ageMin !== null) {
      items = items.filter((s) => s.ageMax >= filters.ageMin!);
    }
    if (filters?.ageMax !== undefined && filters.ageMax !== null) {
      items = items.filter((s) => s.ageMin <= filters.ageMax!);
    }
    if (filters?.featured !== undefined) {
      items = items.filter((s) => s.featured === filters.featured);
    }
    if (filters?.published !== undefined) {
      items = items.filter((s) => s.published === filters.published);
    }
    if (filters?.visibility) {
      items = items.filter((s) => s.access.visibility === filters.visibility);
    }

    const sortBy = filters?.sortBy ?? 'sortOrder';
    items.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.fa.localeCompare(b.title.fa, 'fa');
      }
      if (sortBy === 'publishedAt') {
        return (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '');
      }
      return a.sortOrder - b.sortOrder;
    });

    const total = items.length;
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 50;
    const start = (page - 1) * limit;
    items = items.slice(start, start + limit);
    return { items, total };
  }

  getStory(id: string): StoryDetail | undefined {
    return this.stories().find((s) => s.id === id);
  }

  createStory(payload: StoryPayload): StoryDetail {
    const maxOrder = Math.max(0, ...this.stories().map((s) => s.sortOrder));
    const story: StoryDetail = {
      id: payload.id ?? crypto.randomUUID(),
      title: payload.title,
      description: payload.description,
      coverUrl: payload.coverUrl,
      audioUrl: payload.audioUrl,
      durationSeconds: payload.durationSeconds,
      ageMin: payload.ageMin,
      ageMax: payload.ageMax,
      categoryId: payload.categoryId,
      featured: payload.featured,
      sortOrder: payload.sortOrder ?? maxOrder + 1,
      published: payload.published,
      publishedAt: payload.publishedAt,
      access: normalizeStoryAccess(payload.access),
      chapters: [],
    };
    this.stories.update((items) => [...items, story]);
    this.log('create', 'story', story.id, story.title.fa);
    return story;
  }

  updateStory(id: string, payload: StoryPayload): StoryDetail {
    const existing = this.getStory(id);
    const wasPublished = existing?.published ?? false;
    const updated = this.stories().map((s) =>
      s.id === id
        ? {
            ...s,
            title: payload.title,
            description: payload.description,
            coverUrl: payload.coverUrl,
            audioUrl: payload.audioUrl,
            durationSeconds: payload.durationSeconds,
            ageMin: payload.ageMin,
            ageMax: payload.ageMax,
            categoryId: payload.categoryId,
            featured: payload.featured,
            sortOrder: payload.sortOrder,
            published: payload.published,
            publishedAt: payload.publishedAt,
            access: normalizeStoryAccess(payload.access),
          }
        : s,
    );
    this.stories.set(updated);
    const story = updated.find((s) => s.id === id)!;
    this.log('update', 'story', story.id, story.title.fa);
    if (wasPublished || story.published) {
      this.bumpCatalogVersion();
    }
    return story;
  }

  updateChapters(id: string, chapters: StoryChapter[]): StoryDetail {
    const updated = this.stories().map((s) => (s.id === id ? { ...s, chapters } : s));
    this.stories.set(updated);
    const story = updated.find((s) => s.id === id)!;
    this.log('update', 'story', story.id, `${story.title.fa} — فصل‌ها`);
    if (story.published) {
      this.bumpCatalogVersion();
    }
    return story;
  }

  deleteStory(id: string): void {
    const story = this.getStory(id);
    this.stories.update((items) => items.filter((s) => s.id !== id));
    if (story) {
      this.log('delete', 'story', story.id, story.title.fa);
    }
    if (story?.published) {
      this.bumpCatalogVersion();
    }
  }

  publishStory(id: string, published: boolean): Story {
    const updated = this.stories().map((s) =>
      s.id === id
        ? {
            ...s,
            published,
            publishedAt: published ? new Date().toISOString() : undefined,
          }
        : s,
    );
    this.stories.set(updated);
    const story = updated.find((s) => s.id === id)!;
    this.log(published ? 'publish' : 'unpublish', 'story', story.id, story.title.fa);
    this.bumpCatalogVersion();
    return story;
  }

  toggleFeatured(id: string, featured: boolean): Story {
    const updated = this.stories().map((s) => (s.id === id ? { ...s, featured } : s));
    this.stories.set(updated);
    const story = updated.find((s) => s.id === id)!;
    this.log('update', 'story', story.id, `${story.title.fa} — ویژه: ${featured ? 'بله' : 'خیر'}`);
    if (story.published) {
      this.bumpCatalogVersion();
    }
    return story;
  }

  reorderStories(ids: string[]): Story[] {
    const map = new Map(this.stories().map((s) => [s.id, s]));
    const reordered = ids
      .map((id, index) => {
        const story = map.get(id);
        return story ? { ...story, sortOrder: index + 1 } : null;
      })
      .filter((s): s is StoryDetail => s !== null);
    const remaining = this.stories().filter((s) => !ids.includes(s.id));
    this.stories.set([...reordered, ...remaining]);
    this.log('reorder', 'story', 'all', 'مرتب‌سازی قصه‌ها');
    this.bumpCatalogVersion();
    return reordered;
  }

  getCatalogVersion(): CatalogVersion {
    return this.catalogVersion();
  }

  rebuildCatalogVersion(): CatalogVersion {
    this.bumpCatalogVersion();
    const version = this.catalogVersion();
    this.log('rebuild_version', 'catalog', '1', version.version);
    return version;
  }

  getDashboardStats(): DashboardStats {
    const allStories = this.stories();
    const publishedStories = allStories.filter((s) => s.published);
    const featuredStories = allStories.filter((s) => s.featured);
    const allCategories = this.categories();
    const publishedCategories = allCategories.filter((c) => c.published);
    const lastPublished = publishedStories
      .map((s) => s.publishedAt)
      .filter(Boolean)
      .sort()
      .pop();

    return {
      totalStories: allStories.length,
      publishedStories: publishedStories.length,
      draftStories: allStories.length - publishedStories.length,
      featuredStories: featuredStories.length,
      totalCategories: allCategories.length,
      publishedCategories: publishedCategories.length,
      views: structuredClone(MOCK_DASHBOARD_VIEWS),
      catalogVersion: this.catalogVersion(),
      lastPublishedAt: lastPublished,
    };
  }

  getAuditLogs(filters?: { entityType?: string; limit?: number }): AuditLogEntry[] {
    let logs = [...this.auditLogs()].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    if (filters?.entityType) {
      logs = logs.filter((l) => l.entityType === filters.entityType);
    }
    if (filters?.limit) {
      logs = logs.slice(0, filters.limit);
    }
    return logs;
  }

  private log(
    action: AuditAction,
    entityType: AuditEntityType,
    entityId: string,
    entityTitle: string,
    details?: string,
  ): void {
    const entry: AuditLogEntry = {
      id: crypto.randomUUID(),
      action,
      entityType,
      entityId,
      entityTitle,
      actorEmail: MOCK_ADMIN.email,
      timestamp: new Date().toISOString(),
      details,
    };
    this.auditLogs.update((items) => [entry, ...items].slice(0, 200));
  }

  private bumpCatalogVersion(): void {
    const now = new Date().toISOString();
    const publishedStoryCount = this.stories().filter((s) => s.published).length;
    const publishedCategoryCount = this.categories().filter((c) => c.published).length;
    this.catalogVersion.set({
      version: `${now}-${publishedStoryCount}-${publishedCategoryCount}`,
      updatedAt: now,
    });
  }
}
