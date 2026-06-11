import { Routes } from '@angular/router';
import { PacienteListComponent } from './pages/paciente-list/paciente-list.component';
import { PacienteDetailComponent } from './pages/paciente-detail/paciente-detail.component';

export const PACIENTES_ROUTES: Routes = [
  { path: '', component: PacienteListComponent },
  { path: ':id', component: PacienteDetailComponent }
];
