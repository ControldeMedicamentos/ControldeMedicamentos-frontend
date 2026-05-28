import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PacienteUiStateService {
  viewMode: 'grid' | 'list' = 'grid';
  filtroEstado: 'todos' | 'activos' | 'inactivos' = 'activos';
  busqueda = '';
  page = 1;
}
