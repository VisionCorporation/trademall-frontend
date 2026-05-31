import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../../../services/login/login.service';
import { filter, map, take } from 'rxjs';

export const vendorApprovalGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(LoginService);

  return authService.sessionLoaded$.pipe(
    filter((loaded) => loaded === true),
    take(1),
    map(() => {
      const user = authService.getCurrentUser();

      if (user?.vendorStatus === 'approved') {
        return true;
      }

      return router.createUrlTree(['/vendor-application-status']);
    })
  );
};