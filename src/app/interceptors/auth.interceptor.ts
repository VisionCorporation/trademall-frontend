import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast/toast.service';
import { LoginService } from '../services/login/login.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);
  const auth = inject(LoginService);

  const cloned = req.clone({ withCredentials: true });

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      const isSessionCheck = req.url.includes('/user/me');
      const isLoginRequest = req.url.includes('/user/login');
      const isLoggedIn = auth.isLoggedIn();

      if (error.status === 401 && !isSessionCheck && !isLoginRequest && !isLoggedIn) {
        router.navigate(['/login']);
        toast.error('You need to login first to access this.');
      }

      return throwError(() => error);
    }),
  );
};
