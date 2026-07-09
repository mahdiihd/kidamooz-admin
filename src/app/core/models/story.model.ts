import { LocalizedText } from './localized-text.model';
import { StoryAccess } from './story-access.model';

export interface Story {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  coverUrl: string;
  audioUrl: string;
  durationSeconds: number;
  ageMin: number;
  ageMax: number;
  categoryId: string;
  featured: boolean;
  sortOrder: number;
  published: boolean;
  publishedAt?: string;
  access: StoryAccess;
}

export interface StoryChapter {
  title: LocalizedText;
  startSeconds: number;
  imageUrl: string;
}

export interface StoryDetail extends Story {
  chapters?: StoryChapter[];
}

export type StoryPayload = Omit<Story, 'id'> & { id?: string };

export interface StoryListResponse {
  items: Story[];
  total: number;
}
