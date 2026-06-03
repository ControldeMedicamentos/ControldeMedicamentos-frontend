import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  authService.refreshPermisos();

  if (!authService.canReadPath(state.url)) {
    return router.createUrlTree([authService.firstAccessiblePath()]);
  }

  return true;
};
