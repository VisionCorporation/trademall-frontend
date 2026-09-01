import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast/toast.service';
import { REQUEST } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);
  const platformId = inject(PLATFORM_ID);

  let cloned = req.clone({ withCredentials: true });

  if (isPlatformServer(platformId)) {
    const request = inject(REQUEST, { optional: true });
    console.log('[SSR DEBUG] request exists:', !!request);
    console.log('[SSR DEBUG] cookie header:', request?.headers.get('cookie'));
    const cookieHeader = request?.headers.get('cookie');
    if (cookieHeader) {
      cloned = cloned.clone({ setHeaders: { cookie: cookieHeader } });
    }
  }

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      const isSessionCheck = req.url.includes('/user/me');
      const isLoginRequest = req.url.includes('/user/login');
      const isCartCheck = req.url.includes('/cart');

      if (error.status === 401 && !isSessionCheck && !isLoginRequest && !isCartCheck) {
        const returnUrl = router.url;

        router.navigate(['/login'], {
          queryParams: returnUrl !== '/login' ? { returnUrl } : {},
        });
        toast.error('You need to login first to access this.');
      }

      return throwError(() => error);
    }),
  );
};