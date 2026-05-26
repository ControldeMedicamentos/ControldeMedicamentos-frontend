import { Routes } from '@angular/router';
import { PacienteListComponent } from './pages/paciente-list/paciente-list.component';

export const PACIENTES_ROUTES: Routes = [
  {
    path: '',
    component: PacienteListComponent
  }
];
