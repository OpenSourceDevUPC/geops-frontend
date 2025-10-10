import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    console.log('[AuthGuard] Usuario autenticado, acceso permitido');
    return true;
  }

  console.warn('[AuthGuard] No autenticado, redirigiendo a login');
  return router.createUrlTree(['/login']);
};
