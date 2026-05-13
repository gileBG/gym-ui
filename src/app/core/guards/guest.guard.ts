import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return true;
  }

  const role = auth.userRole();
  if (role === 'ADMIN' || role === 'ZAPOSLENI') {
    return router.createUrlTree(['/dashboard']);
  }
  return router.createUrlTree(['/profil']);
};
