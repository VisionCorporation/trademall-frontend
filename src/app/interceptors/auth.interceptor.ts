import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);

  const cloned = req.clone({ withCredentials: true });

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      const isSessionCheck = req.url.includes('/user/me');
      const isLoginRequest = req.url.includes('/user/login');
      const isCartCheck = req.url.includes('/cart');

      if (error.status === 401 && !isSessionCheck && !isLoginRequest && !isCartCheck) {
        router.navigate(['/login']);
        toast.error('You need to login first to access this.');
      }

      return throwError(() => error);
    }),
  );
};