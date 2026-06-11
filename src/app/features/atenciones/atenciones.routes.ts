import { Routes } from '@angular/router';
import { AtencionCreateComponent } from './pages/atencion-create/atencion-create.component';
import { AtencionListComponent } from './pages/atencion-list/atencion-list.component';

export const ATENCIONES_ROUTES: Routes = [
  { path: '', component: AtencionListComponent },
  { path: 'nueva', component: AtencionCreateComponent }
];
