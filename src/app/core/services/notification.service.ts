import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BroadcastNotificationRequest,
  BroadcastNotificationResponse,
} from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/notifications`;

  broadcast(payload: BroadcastNotificationRequest): Observable<BroadcastNotificationResponse> {
    return this.http.post<BroadcastNotificationResponse>(`${this.baseUrl}/broadcast`, payload);
  }
}
