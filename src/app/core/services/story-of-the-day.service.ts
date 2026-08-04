import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminStoryOfTheDay {
  pickDate: string;
  storyId: string;
  titleFa: string;
  isValid: boolean;
}

@Injectable({ providedIn: 'root' })
export class StoryOfTheDayService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/story-of-the-day`;

  getToday(): Observable<AdminStoryOfTheDay | null> {
    return this.http.get<AdminStoryOfTheDay | null>(this.baseUrl);
  }

  setToday(storyId: string): Observable<AdminStoryOfTheDay> {
    return this.http.put<AdminStoryOfTheDay>(this.baseUrl, { storyId });
  }

  clearToday(storyId?: string): Observable<void> {
    let params = new HttpParams();
    if (storyId) {
      params = params.set('storyId', storyId);
    }
    return this.http.delete<void>(this.baseUrl, { params });
  }
}
