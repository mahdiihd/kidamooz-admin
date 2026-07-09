import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Story,
  StoryChapter,
  StoryDetail,
  StoryListResponse,
  StoryPayload,
} from '../models/story.model';
import { MockStore, StoryQueryFilters } from './mock-store.service';

export type StoryFilters = StoryQueryFilters;

@Injectable({ providedIn: 'root' })
export class StoryService {
  private readonly http = inject(HttpClient);
  private readonly mockStore = inject(MockStore);

  getAll(filters?: StoryFilters): Observable<StoryListResponse> {
    if (environment.useMock) {
      return of(this.mockStore.getStories(filters)).pipe(delay(300));
    }

    let params = new HttpParams();
    if (filters?.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters?.ageMin !== undefined) params = params.set('ageMin', filters.ageMin.toString());
    if (filters?.ageMax !== undefined) params = params.set('ageMax', filters.ageMax.toString());
    if (filters?.featured !== undefined) params = params.set('featured', String(filters.featured));
    if (filters?.published !== undefined) params = params.set('published', String(filters.published));
    if (filters?.visibility) params = params.set('visibility', filters.visibility);
    if (filters?.page) params = params.set('page', filters.page.toString());
    if (filters?.limit) params = params.set('limit', filters.limit.toString());
    if (filters?.sortBy) params = params.set('sortBy', filters.sortBy);

    return this.http.get<StoryListResponse>(`${environment.apiBaseUrl}/stories`, { params });
  }

  getById(id: string): Observable<StoryDetail> {
    if (environment.useMock) {
      const story = this.mockStore.getStory(id);
      if (!story) {
        throw new Error('قصه یافت نشد');
      }
      return of(story).pipe(delay(200));
    }
    return this.http.get<StoryDetail>(`${environment.apiBaseUrl}/stories/${id}`);
  }

  create(payload: StoryPayload): Observable<StoryDetail> {
    if (environment.useMock) {
      return of(this.mockStore.createStory(payload)).pipe(delay(400));
    }
    return this.http.post<StoryDetail>(`${environment.apiBaseUrl}/stories`, payload);
  }

  update(id: string, payload: StoryPayload): Observable<StoryDetail> {
    if (environment.useMock) {
      return of(this.mockStore.updateStory(id, payload)).pipe(delay(400));
    }
    return this.http.put<StoryDetail>(`${environment.apiBaseUrl}/stories/${id}`, payload);
  }

  updateChapters(id: string, chapters: StoryChapter[]): Observable<StoryDetail> {
    if (environment.useMock) {
      return of(this.mockStore.updateChapters(id, chapters)).pipe(delay(400));
    }
    return this.http.put<StoryDetail>(`${environment.apiBaseUrl}/stories/${id}/chapters`, {
      chapters,
    });
  }

  delete(id: string): Observable<void> {
    if (environment.useMock) {
      this.mockStore.deleteStory(id);
      return of(undefined).pipe(delay(300));
    }
    return this.http.delete<void>(`${environment.apiBaseUrl}/stories/${id}`);
  }

  publish(id: string, published: boolean): Observable<Story> {
    if (environment.useMock) {
      return of(this.mockStore.publishStory(id, published)).pipe(delay(300));
    }
    return this.http.post<Story>(`${environment.apiBaseUrl}/stories/${id}/publish`, { published });
  }

  toggleFeatured(id: string, featured: boolean): Observable<Story> {
    if (environment.useMock) {
      return of(this.mockStore.toggleFeatured(id, featured)).pipe(delay(200));
    }
    return this.http.post<Story>(`${environment.apiBaseUrl}/stories/${id}/featured`, { featured });
  }

  reorder(ids: string[]): Observable<Story[]> {
    if (environment.useMock) {
      return of(this.mockStore.reorderStories(ids)).pipe(delay(300));
    }
    return this.http.put<Story[]>(`${environment.apiBaseUrl}/stories/reorder`, { ids });
  }
}
