import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  const cloned = req.clone({ withCredentials: true });

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      const isSessionCheck = req.url.includes('/user/me');
      const isLoginRequest = req.url.includes('/user/login');

      if (error.status === 401 && !isSessionCheck && !isLoginRequest) {
        router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};
