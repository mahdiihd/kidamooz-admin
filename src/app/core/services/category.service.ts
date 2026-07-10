import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, CategoryPayload } from '../models/category.model';
import { MockStore } from './mock-store.service';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly mockStore = inject(MockStore);

  getAll(): Observable<Category[]> {
    if (environment.useMock) {
      return of(this.mockStore.getCategories()).pipe(delay(300));
    }
    return this.http.get<Category[]>(`${environment.apiBaseUrl}/categories`);
  }

  getById(id: string): Observable<Category> {
    if (environment.useMock) {
      const category = this.mockStore.getCategory(id);
      if (!category) {
        throw new Error('دسته‌بندی یافت نشد');
      }
      return of(category).pipe(delay(200));
    }
    return this.http.get<Category>(`${environment.apiBaseUrl}/categories/${id}`);
  }

  create(payload: CategoryPayload, icon?: File | null): Observable<Category> {
    if (environment.useMock) {
      return of(this.mockStore.createCategory(payload)).pipe(delay(400));
    }
    return this.http.post<Category>(
      `${environment.apiBaseUrl}/categories`,
      this.toFormData(payload, icon),
    );
  }

  update(id: string, payload: CategoryPayload, icon?: File | null): Observable<Category> {
    if (environment.useMock) {
      return of(this.mockStore.updateCategory(id, payload)).pipe(delay(400));
    }
    return this.http.put<Category>(
      `${environment.apiBaseUrl}/categories/${id}`,
      this.toFormData(payload, icon),
    );
  }

  delete(id: string): Observable<void> {
    if (environment.useMock) {
      this.mockStore.deleteCategory(id);
      return of(undefined).pipe(delay(300));
    }
    return this.http.delete<void>(`${environment.apiBaseUrl}/categories/${id}`);
  }

  publish(id: string, published: boolean): Observable<Category> {
    if (environment.useMock) {
      return of(this.mockStore.publishCategory(id, published)).pipe(delay(300));
    }
    return this.http.post<Category>(`${environment.apiBaseUrl}/categories/${id}/publish`, {
      published,
    });
  }

  reorder(ids: string[]): Observable<Category[]> {
    if (environment.useMock) {
      return of(this.mockStore.reorderCategories(ids)).pipe(delay(300));
    }
    return this.http.put<Category[]>(`${environment.apiBaseUrl}/categories/reorder`, { ids });
  }

  private toFormData(payload: CategoryPayload, icon?: File | null): FormData {
    const formData = new FormData();
    if (payload.id) {
      formData.append('id', payload.id);
    }
    formData.append('titleFa', payload.title.fa);
    formData.append('titleEn', payload.title.en);
    formData.append('slug', payload.slug);
    formData.append('color', payload.color);
    formData.append('sortOrder', String(payload.sortOrder));
    formData.append('published', String(payload.published));
    if (payload.iconUrl && !payload.iconUrl.startsWith('blob:')) {
      formData.append('iconUrl', payload.iconUrl);
    }
    if (icon) {
      formData.append('icon', icon, icon.name);
    }
    return formData;
  }
}
