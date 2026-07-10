import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminUser,
  CreateAdminUserRequest,
  ResetAdminPasswordRequest,
} from '../models/admin-user.model';

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/users`;

  getAll(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(this.baseUrl);
  }

  create(payload: CreateAdminUserRequest): Observable<AdminUser> {
    return this.http.post<AdminUser>(this.baseUrl, payload);
  }

  resetPassword(id: string, payload: ResetAdminPasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/password`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
