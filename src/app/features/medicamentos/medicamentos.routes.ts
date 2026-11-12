import { Routes } from '@angular/router';
import { AjustesInventarioComponent } from './pages/ajustes-inventario/ajustes-inventario.component';
import { MedicamentosListComponent } from './pages/medicamentos-list/medicamentos-list.component';
import { permissionGuard } from '../../core/guards/permission.guard';

export const MEDICAMENTOS_ROUTES: Routes = [
  { path: '', component: MedicamentosListComponent },
  {
    path: 'ajustes',
    component: AjustesInventarioComponent,
    canActivate: [permissionGuard],
    data: { permissionPath: '/medicamentos/ajustes', permissionAction: 'edit' }
  }
];
