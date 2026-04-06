import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { LoginService } from '../../services/login/login.service';
import { inject } from '@angular/core';
import { ToastService } from '../../services/toast/toast.service';
import { filter, map, take } from 'rxjs';

export const customerGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const authService = inject(LoginService);
  const toastService = inject(ToastService);
  const router = inject(Router);

  return authService.sessionLoaded$.pipe(
    filter((loaded) => loaded === true),
    take(1),
    map(() => {
      const user = authService.getCurrentUser();

      if (user && user.userType === 'customer') {
        return true;
      }

      toastService.error('You are not authorized to access this page');
      return router.createUrlTree(['/']);
    }),
  );
};
