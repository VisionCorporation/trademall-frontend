import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { LoginService } from '../../../services/login/login.service';
import { ToastService } from '../../../services/toast/toast.service';
import { inject } from '@angular/core';
import { filter, map, take } from 'rxjs';

export const vendorGuard: CanActivateFn = (route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot) => {
  const authService = inject(LoginService);
  const toastService = inject(ToastService);
  const router = inject(Router);

  return authService.sessionLoaded$.pipe(
    filter((loaded) => loaded === true),
    take(1),
    map(() => {
      const user = authService.getCurrentUser();

      if (user && user.userType === 'vendor') {
        return true;
      }

      toastService.error('You are not authorized to access this page');
      return router.createUrlTree(['/']);
    }),
  );
};
