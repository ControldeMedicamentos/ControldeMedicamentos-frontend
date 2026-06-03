import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: AuthLayoutComponent,
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES)
  },
  {
    path: 'cambiar-contrasena',
    component: AuthLayoutComponent,
    loadChildren: () => import('./features/auth/cambiar-contrasena.routes').then((m) => m.CAMBIAR_CONTRASENA_ROUTES)
  },
  {
    path: 'restablecer-contrasena',
    component: AuthLayoutComponent,
    loadChildren: () => import('./features/auth/restablecer-contrasena.routes').then((m) => m.RESTABLECER_CONTRASENA_ROUTES)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES)
      },
      {
        path: 'pacientes',
        loadChildren: () => import('./features/pacientes/pacientes.routes').then((m) => m.PACIENTES_ROUTES)
      },
      {
        path: 'atenciones',
        loadChildren: () => import('./features/atenciones/atenciones.routes').then((m) => m.ATENCIONES_ROUTES)
      },
      {
        path: 'medicamentos',
        loadChildren: () => import('./features/medicamentos/medicamentos.routes').then((m) => m.MEDICAMENTOS_ROUTES)
      },
      {
        path: 'reportes',
        loadChildren: () => import('./features/reportes/reportes.routes').then((m) => m.REPORTES_ROUTES)
      },
      {
        path: 'empleados',
        loadChildren: () => import('./features/empleados/empleados.routes').then((m) => m.EMPLEADOS_ROUTES)
      },
      {
        path: 'roles',
        loadChildren: () => import('./features/roles/roles.routes').then((m) => m.ROLES_ROUTES)
      },
      {
        path: 'auditoria',
        loadChildren: () => import('./features/auditoria/auditoria.routes').then((m) => m.AUDITORIA_ROUTES)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
