import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const permissionGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const path = String(route.data['permissionPath'] ?? '');
  const action = String(route.data['permissionAction'] ?? 'read');

  const allowed = action === 'write'
    ? auth.canWrite(path)
    : action === 'edit'
      ? auth.canEdit(path)
      : action === 'delete'
        ? auth.canDelete(path)
        : auth.canReadPath(path);

  return allowed ? true : router.createUrlTree([auth.firstAccessiblePath()]);
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAdmin() ? true : router.createUrlTree([auth.firstAccessiblePath()]);
};
