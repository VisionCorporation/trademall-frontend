import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { LoginService } from '../../../services/login/login.service';

export const storeEditGuard: CanActivateFn = () => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  return loginService.user$.pipe(
    take(1),
    map((user) => {
      if (!user) {
        return router.createUrlTree(['/login']);
      }

      return user.store
        ? true
        : router.createUrlTree(['/vendor/store/create']);
    })
  );
};