import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth.model';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const allowedRoles: UserRole[] = route.data['roles'] ?? [];
  if (allowedRoles.length === 0 || auth.hasRole(...allowedRoles)) {
    return true;
  }

  return router.createUrlTree(['/']);
};
