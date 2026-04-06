import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { LoginService } from '../../services/login/login.service';
import { inject } from '@angular/core';
import { filter, map, take } from 'rxjs';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const authService = inject(LoginService);
  const router = inject(Router);

  return authService.sessionLoaded$.pipe(
    filter((loaded) => loaded === true),
    take(1),
    map(() => {
      if (authService.isLoggedIn()) {
        return true;
      }
      return router.createUrlTree(['/login']);
    }),
  );
};
