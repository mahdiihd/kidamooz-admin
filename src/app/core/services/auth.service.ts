import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthTokens, LoginRequest } from '../models/auth.model';
import { MOCK_ADMIN } from '../data/mock-data';

const TOKEN_KEY = 'kidamooz_admin_token';
const REFRESH_KEY = 'kidamooz_admin_refresh';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  login(credentials: LoginRequest): Observable<AuthTokens> {
    if (environment.useMock) {
      if (
        credentials.email === MOCK_ADMIN.email &&
        credentials.password === MOCK_ADMIN.password
      ) {
        const tokens: AuthTokens = {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        };
        this.storeTokens(tokens);
        return of(tokens).pipe(delay(400));
      }
      return throwError(() => new Error('ایمیل یا رمز عبور اشتباه است')).pipe(delay(400));
    }

    return this.http.post<AuthTokens>(`${environment.apiBaseUrl}/auth/login`, credentials);
  }

  logout(): Observable<void> {
    if (environment.useMock) {
      this.clearTokens();
      return of(undefined).pipe(delay(200));
    }

    return this.http.post<void>(`${environment.apiBaseUrl}/auth/logout`, {});
  }

  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  storeTokens(tokens: AuthTokens): void {
    localStorage.setItem(TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }
}
