import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CatalogVersion, DashboardStats } from '../models/catalog.model';
import { MockStore } from './mock-store.service';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly mockStore = inject(MockStore);

  getVersion(): Observable<CatalogVersion> {
    if (environment.useMock) {
      return of(this.mockStore.getCatalogVersion()).pipe(delay(200));
    }
    return this.http.get<CatalogVersion>(`${environment.apiBaseUrl}/catalog/version`);
  }

  getDashboardStats(): Observable<DashboardStats> {
    if (environment.useMock) {
      return of(this.mockStore.getDashboardStats()).pipe(delay(300));
    }
    return this.http.get<DashboardStats>(`${environment.apiBaseUrl}/dashboard`);
  }

  rebuildVersion(): Observable<CatalogVersion> {
    if (environment.useMock) {
      return of(this.mockStore.rebuildCatalogVersion()).pipe(delay(300));
    }
    return this.http.post<CatalogVersion>(
      `${environment.apiBaseUrl}/catalog/rebuild-version`,
      {},
    );
  }
}
