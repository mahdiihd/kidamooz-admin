import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export type MediaType = 'cover' | 'audio' | 'icon';

export interface UploadUrlResponse {
  uploadUrl: string;
  publicUrl: string;
  expiresAt: string;
}

@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly http = inject(HttpClient);

  uploadLocal(file: File, mediaType: MediaType): Observable<string> {
    if (environment.useMock) {
      return new Observable<string>((subscriber) => {
        const reader = new FileReader();
        reader.onload = () => {
          subscriber.next(reader.result as string);
          subscriber.complete();
        };
        reader.readAsDataURL(file);
      }).pipe(delay(300));
    }

    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('mediaType', mediaType);

    return this.http
      .post<{ url: string }>(`${environment.apiBaseUrl}/media/upload`, formData)
      .pipe(map((response) => response.url));
  }
}
