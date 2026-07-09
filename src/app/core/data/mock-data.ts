import { Category } from '../models/category.model';
import { StoryDetail } from '../models/story.model';
import { CatalogVersion, DashboardViews } from '../models/catalog.model';
import { AuditLogEntry } from '../models/audit-log.model';
import { DEFAULT_STORY_ACCESS } from '../models/story-access.model';

const audioSample = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3';

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'forest',
    title: { fa: 'جنگل جادویی', en: 'Magic Forest' },
    slug: 'forest',
    iconUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=200&fit=crop',
    color: '#7bc950',
    sortOrder: 1,
    published: true,
  },
  {
    id: 'space',
    title: { fa: 'سفر به فضا', en: 'Space Journey' },
    slug: 'space',
    iconUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=200&h=200&fit=crop',
    color: '#d4a5f9',
    sortOrder: 2,
    published: true,
  },
  {
    id: 'ocean',
    title: { fa: 'اعماق دریا', en: 'Ocean Depths' },
    slug: 'ocean',
    iconUrl: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?w=200&h=200&fit=crop',
    color: '#ff8a65',
    sortOrder: 3,
    published: true,
  },
  {
    id: 'animals',
    title: { fa: 'دوستان حیوانی', en: 'Animal Friends' },
    slug: 'animals',
    iconUrl: 'https://images.unsplash.com/photo-1474511320723-9a8ddc4ad114?w=200&h=200&fit=crop',
    color: '#ef476f',
    sortOrder: 4,
    published: false,
  },
];

export const MOCK_STORIES: StoryDetail[] = [
  {
    id: '1',
    title: { fa: 'خرگوش کوچولوی خواب‌آلود', en: 'Sleepy Little Rabbit' },
    description: {
      fa: 'خرگوش کوچولو قبل از خواب، ستاره‌ها رو می‌شماره.',
      en: 'A little rabbit counts stars before sleep.',
    },
    coverUrl: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=400&fit=crop',
    audioUrl: audioSample,
    durationSeconds: 420,
    ageMin: 3,
    ageMax: 6,
    categoryId: 'forest',
    featured: true,
    sortOrder: 1,
    published: true,
    publishedAt: '2026-07-01T10:00:00Z',
    access: structuredClone(DEFAULT_STORY_ACCESS),
    chapters: [
      {
        title: { fa: 'شروع قصه', en: 'Beginning' },
        startSeconds: 0,
        imageUrl: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=400&fit=crop',
      },
      {
        title: { fa: 'شمارش ستاره‌ها', en: 'Counting Stars' },
        startSeconds: 120,
        imageUrl: 'https://images.unsplash.com/photo-1419242902214-272b31f03b6b?w=400&h=400&fit=crop',
      },
    ],
  },
  {
    id: '2',
    title: { fa: 'ماه و پنگوئن', en: 'Moon and Penguin' },
    description: {
      fa: 'پنگوئن کوچولو با ماه دوست می‌شه.',
      en: 'A little penguin befriends the moon.',
    },
    coverUrl: 'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=400&h=400&fit=crop',
    audioUrl: audioSample,
    durationSeconds: 360,
    ageMin: 4,
    ageMax: 7,
    categoryId: 'ocean',
    featured: false,
    sortOrder: 2,
    published: true,
    publishedAt: '2026-07-02T14:30:00Z',
    access: structuredClone(DEFAULT_STORY_ACCESS),
  },
  {
    id: '3',
    title: { fa: 'موشک رویایی', en: 'Dream Rocket' },
    description: {
      fa: 'سفر شبانه به کهکشان رنگی.',
      en: 'A nightly journey to a colorful galaxy.',
    },
    coverUrl: 'https://images.unsplash.com/photo-1457364555414-44fbef6098d3?w=400&h=400&fit=crop',
    audioUrl: audioSample,
    durationSeconds: 480,
    ageMin: 5,
    ageMax: 8,
    categoryId: 'space',
    featured: true,
    sortOrder: 3,
    published: true,
    publishedAt: '2026-07-05T09:00:00Z',
    access: {
      visibility: 'restricted',
      audience: { segmentIds: ['premium', 'beta'], userIds: [] },
    },
  },
  {
    id: '4',
    title: { fa: 'شیر مهربون', en: 'Kind Lion' },
    description: {
      fa: 'شیر کوچولو یاد می‌گیره مهربون باشه.',
      en: 'A little lion learns to be kind.',
    },
    coverUrl: 'https://images.unsplash.com/photo-1546182990-d4af86ef1399?w=400&h=400&fit=crop',
    audioUrl: audioSample,
    durationSeconds: 300,
    ageMin: 3,
    ageMax: 6,
    categoryId: 'animals',
    featured: false,
    sortOrder: 4,
    published: false,
    access: {
      visibility: 'restricted',
      audience: { segmentIds: [], userIds: ['u-1001', 'u-1003'] },
    },
  },
];

export const MOCK_CATALOG_VERSION: CatalogVersion = {
  version: '2026-07-09T12:00:00Z',
  updatedAt: '2026-07-09T12:00:00Z',
};

export const MOCK_DASHBOARD_VIEWS: DashboardViews = {
  total: 12_840,
  today: 342,
  thisWeek: 2_156,
};

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: '1',
    action: 'publish',
    entityType: 'story',
    entityId: '3',
    entityTitle: 'موشک رویایی',
    actorEmail: 'admin@kidamooz.com',
    timestamp: '2026-07-05T09:00:00Z',
  },
  {
    id: '2',
    action: 'update',
    entityType: 'category',
    entityId: 'forest',
    entityTitle: 'جنگل جادویی',
    actorEmail: 'admin@kidamooz.com',
    timestamp: '2026-07-04T11:20:00Z',
  },
  {
    id: '3',
    action: 'create',
    entityType: 'story',
    entityId: '4',
    entityTitle: 'شیر مهربون',
    actorEmail: 'admin@kidamooz.com',
    timestamp: '2026-07-03T16:45:00Z',
  },
];

export const MOCK_ADMIN = {
  email: 'admin@kidamooz.com',
  password: 'admin123',
};
