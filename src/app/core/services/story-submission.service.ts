import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { sanitizeMediaUrl, sanitizePlainText } from '../utils/sanitize.util';

export interface StorySubmission {
  id: string;
  status: string;
  drawingUrl?: string | null;
  coverUrl?: string | null;
  usedFallbackCover: boolean;
  titleFa: string;
  descriptionFa: string;
  storyScript: string;
  challengeTag?: string | null;
  audioUrl?: string | null;
  durationSeconds?: number | null;
  publishedStoryId?: string | null;
  errorMessage?: string | null;
  rejectReason?: string | null;
  authorName?: string | null;
  authorMobile?: string | null;
  submittedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  canRemoveFromProfile?: boolean;
}

export interface ApproveStorySubmissionResponse {
  draftId: string;
  storyId: string;
  draft: StorySubmission;
}

function sanitizeSubmission(item: StorySubmission): StorySubmission {
  return {
    ...item,
    drawingUrl: sanitizeMediaUrl(item.drawingUrl),
    coverUrl: sanitizeMediaUrl(item.coverUrl),
    audioUrl: sanitizeMediaUrl(item.audioUrl),
    titleFa: sanitizePlainText(item.titleFa, 300),
    descriptionFa: sanitizePlainText(item.descriptionFa, 2000),
    storyScript: sanitizePlainText(item.storyScript, 8000),
    authorName: item.authorName ? sanitizePlainText(item.authorName, 200) : item.authorName,
    errorMessage: item.errorMessage
      ? sanitizePlainText(item.errorMessage, 500)
      : item.errorMessage,
    rejectReason: item.rejectReason
      ? sanitizePlainText(item.rejectReason, 500)
      : item.rejectReason,
  };
}

@Injectable({ providedIn: 'root' })
export class StorySubmissionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/story-submissions`;

  list(status?: string | null): Observable<StorySubmission[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http
      .get<StorySubmission[]>(this.base, { params })
      .pipe(map((items) => items.map(sanitizeSubmission)));
  }

  listPending(): Observable<StorySubmission[]> {
    return this.list('pending_review');
  }

  get(id: string): Observable<StorySubmission> {
    return this.http
      .get<StorySubmission>(`${this.base}/${id}`)
      .pipe(map(sanitizeSubmission));
  }

  approve(id: string): Observable<ApproveStorySubmissionResponse> {
    return this.http
      .post<ApproveStorySubmissionResponse>(`${this.base}/${id}/approve`, {})
      .pipe(
        map((res) => ({
          ...res,
          draft: sanitizeSubmission(res.draft),
        }))
      );
  }

  reject(id: string, reason?: string): Observable<StorySubmission> {
    return this.http
      .post<StorySubmission>(`${this.base}/${id}/reject`, {
        reason: reason ? sanitizePlainText(reason, 500) : reason,
      })
      .pipe(map(sanitizeSubmission));
  }
}
