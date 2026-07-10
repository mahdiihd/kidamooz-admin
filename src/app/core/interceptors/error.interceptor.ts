import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

let handlingUnauthorized = false;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse) || !req.url.startsWith(environment.apiBaseUrl)) {
        return throwError(() => err);
      }

      const isLoginRequest = req.url.includes('/auth/login');
      const isLogoutRequest = req.url.includes('/auth/logout');

      if (err.status === 401 && !isLoginRequest) {
        handleUnauthorized(auth, toast, router, isLogoutRequest);
        return throwError(() => err);
      }

      if (!isLoginRequest && !isLogoutRequest) {
        toast.error(resolveErrorMessage(err));
      }

      return throwError(() => err);
    }),
  );
};

function handleUnauthorized(
  auth: AuthService,
  toast: ToastService,
  router: Router,
  silent: boolean,
): void {
  if (handlingUnauthorized) {
    return;
  }

  handlingUnauthorized = true;
  auth.clearTokens();

  if (!silent) {
    toast.error('نشست شما منقضی شده است. دوباره وارد شوید.');
  }

  void router.navigate(['/login']).finally(() => {
    handlingUnauthorized = false;
  });
}

function resolveErrorMessage(err: HttpErrorResponse): string {
  const message = err.error?.message;
  if (typeof message === 'string' && message.trim().length > 0) {
    return message;
  }

  switch (err.status) {
    case 0:
      return 'ارتباط با سرور برقرار نشد';
    case 400:
      return 'درخواست نامعتبر است';
    case 403:
      return 'دسترسی مجاز نیست';
    case 404:
      return 'مورد درخواستی یافت نشد';
    case 409:
      return 'تداخل داده؛ مورد تکراری است';
    case 422:
      return 'اطلاعات ارسال‌شده قابل پردازش نیست';
    case 500:
      return 'خطای داخلی سرور';
    default:
      return 'خطایی رخ داد. دوباره تلاش کنید.';
  }
}
