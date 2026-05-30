import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  const user = authService.getCurrentUser();
  if (user?.mustChangePassword && state.url !== '/cambiar-contrasena') {
    return router.createUrlTree(['/cambiar-contrasena']);
  }

  return true;
};
