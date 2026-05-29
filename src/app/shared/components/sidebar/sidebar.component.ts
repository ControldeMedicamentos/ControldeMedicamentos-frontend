import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface MenuItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  readonly items: MenuItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: 'pi pi-home' },
    { label: 'Pacientes', path: '/pacientes', icon: 'pi pi-users' },
    { label: 'Atenciones', path: '/atenciones', icon: 'pi pi-clipboard' },
    { label: 'Medicamentos', path: '/medicamentos', icon: 'pi pi-box' },
    { label: 'Inventario', path: '/medicamentos/ajustes', icon: 'pi pi-sliders-h' },
    { label: 'Reportes', path: '/reportes', icon: 'pi pi-file-excel' }
  ];
}
