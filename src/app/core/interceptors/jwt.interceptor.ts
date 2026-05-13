import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const isApiRequest = req.url.includes('/api/');
  const isAuthRequest = req.url.includes('/api/auth/');

  let request = req;
  const token = auth.getToken();

  if (isApiRequest && !isAuthRequest) {
    if (!token) {
      auth.logout();
      router.navigate(['/login']);
      return throwError(() => new Error('Missing or expired token'));
    }

    request = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(request).pipe(
    catchError((err) => {
      if (err?.status === 401 && isApiRequest && !isAuthRequest) {
        auth.logout();
        router.navigate(['/login']);
      }

      return throwError(() => err);
    })
  );
};
