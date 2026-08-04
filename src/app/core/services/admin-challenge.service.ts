import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  UpsertWeeklyChallengeRequest,
  WeeklyChallenge,
} from '../models/weekly-challenge.model';

@Injectable({ providedIn: 'root' })
export class AdminChallengeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/challenges`;

  list(): Observable<WeeklyChallenge[]> {
    return this.http.get<WeeklyChallenge[]>(this.baseUrl);
  }

  create(payload: UpsertWeeklyChallengeRequest): Observable<WeeklyChallenge> {
    return this.http.post<WeeklyChallenge>(this.baseUrl, payload);
  }

  update(id: string, payload: UpsertWeeklyChallengeRequest): Observable<WeeklyChallenge> {
    return this.http.put<WeeklyChallenge>(`${this.baseUrl}/${id}`, payload);
  }

  setActive(id: string, isActive: boolean): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/active`, { isActive });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
