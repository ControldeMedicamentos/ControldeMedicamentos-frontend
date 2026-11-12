import { Routes } from '@angular/router';
import { AtencionCreateComponent } from './pages/atencion-create/atencion-create.component';
import { AtencionListComponent } from './pages/atencion-list/atencion-list.component';
import { AtencionEditComponent } from './pages/atencion-edit/atencion-edit.component';
import { permissionGuard } from '../../core/guards/permission.guard';

export const ATENCIONES_ROUTES: Routes = [
  { path: '', component: AtencionListComponent },
  {
    path: 'nueva',
    component: AtencionCreateComponent,
    canActivate: [permissionGuard],
    data: { permissionPath: '/atenciones', permissionAction: 'write' }
  },
  {
    path: ':id/editar',
    component: AtencionEditComponent,
    canActivate: [permissionGuard],
    data: { permissionPath: '/atenciones', permissionAction: 'edit' }
  }
];
