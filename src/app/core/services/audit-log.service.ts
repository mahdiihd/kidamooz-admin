import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditLogEntry } from '../models/audit-log.model';
import { MockStore } from './mock-store.service';

export interface AuditLogFilters {
  entityType?: string;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly http = inject(HttpClient);
  private readonly mockStore = inject(MockStore);

  getAll(filters?: AuditLogFilters): Observable<AuditLogEntry[]> {
    if (environment.useMock) {
      return of(this.mockStore.getAuditLogs(filters)).pipe(delay(250));
    }

    let params = new HttpParams();
    if (filters?.entityType) {
      params = params.set('entityType', filters.entityType);
    }
    if (filters?.limit) {
      params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<AuditLogEntry[]>(`${environment.apiBaseUrl}/audit-logs`, { params });
  }
}
