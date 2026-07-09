import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';
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

  requestUploadUrl(
    fileName: string,
    contentType: string,
    mediaType: MediaType,
  ): Observable<UploadUrlResponse> {
    if (environment.useMock) {
      const publicUrl = URL.createObjectURL(new Blob());
      return of({
        uploadUrl: publicUrl,
        publicUrl,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      }).pipe(delay(300));
    }

    return this.http.post<UploadUrlResponse>(`${environment.apiBaseUrl}/media/upload-url`, {
      fileName,
      contentType,
      mediaType,
    });
  }

  uploadFile(uploadUrl: string, file: File): Observable<void> {
    if (environment.useMock) {
      return of(undefined).pipe(delay(500));
    }

    return this.http.put<void>(uploadUrl, file, {
      headers: { 'Content-Type': file.type },
    });
  }

  confirmUpload(publicUrl: string, mediaType: MediaType): Observable<{ url: string }> {
    if (environment.useMock) {
      return of({ url: publicUrl }).pipe(delay(200));
    }

    return this.http.post<{ url: string }>(`${environment.apiBaseUrl}/media/confirm`, {
      publicUrl,
      mediaType,
    });
  }

  uploadLocal(file: File, mediaType: MediaType): Observable<string> {
    return new Observable((subscriber) => {
      this.requestUploadUrl(file.name, file.type, mediaType).subscribe({
        next: (response) => {
          this.uploadFile(response.uploadUrl, file).subscribe({
            next: () => {
              if (environment.useMock) {
                const reader = new FileReader();
                reader.onload = () => {
                  subscriber.next(reader.result as string);
                  subscriber.complete();
                };
                reader.readAsDataURL(file);
                return;
              }

              this.confirmUpload(response.publicUrl, mediaType).subscribe({
                next: (confirmed) => {
                  subscriber.next(confirmed.url);
                  subscriber.complete();
                },
                error: (err) => subscriber.error(err),
              });
            },
            error: (err) => subscriber.error(err),
          });
        },
        error: (err) => subscriber.error(err),
      });
    });
  }
}
