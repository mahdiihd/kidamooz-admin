import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AudienceSegment, AudienceUser } from '../models/story-access.model';
import { MOCK_AUDIENCE_SEGMENTS, MOCK_AUDIENCE_USERS } from '../data/mock-audience.data';

@Injectable({ providedIn: 'root' })
export class AudienceService {
  private readonly http = inject(HttpClient);

  getSegments(): Observable<AudienceSegment[]> {
    if (environment.useMock) {
      return of(MOCK_AUDIENCE_SEGMENTS).pipe(delay(150));
    }
    return this.http.get<AudienceSegment[]>(`${environment.apiBaseUrl}/audience/segments`);
  }

  getUsers(): Observable<AudienceUser[]> {
    if (environment.useMock) {
      return of(MOCK_AUDIENCE_USERS).pipe(delay(150));
    }
    return this.http.get<AudienceUser[]>(`${environment.apiBaseUrl}/audience/users`);
  }
}
