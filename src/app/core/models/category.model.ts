import { LocalizedText } from './localized-text.model';

export interface Category {
  id: string;
  title: LocalizedText;
  slug: string;
  iconUrl: string;
  color: string;
  sortOrder: number;
  published: boolean;
}

export type CategoryPayload = Omit<Category, 'id'> & { id?: string };
