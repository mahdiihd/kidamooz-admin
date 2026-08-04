import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppMember } from '../models/app-member.model';

@Injectable({ providedIn: 'root' })
export class AdminMemberService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/members`;

  list(search?: string): Observable<AppMember[]> {
    let params = new HttpParams();
    if (search?.trim()) {
      params = params.set('q', search.trim());
    }
    return this.http.get<AppMember[]>(this.baseUrl, { params });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
