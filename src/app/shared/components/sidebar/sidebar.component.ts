import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {
  private readonly authService = inject(AuthService);

  private readonly allItems: MenuItem[] = [
    { label: 'Dashboard',    path: '/dashboard',           icon: 'pi pi-home' },
    { label: 'Pacientes',    path: '/pacientes',            icon: 'pi pi-users' },
    { label: 'Atenciones',   path: '/atenciones',           icon: 'pi pi-clipboard' },
    { label: 'Medicamentos', path: '/medicamentos',         icon: 'pi pi-box' },
    { label: 'Inventario',   path: '/medicamentos/ajustes', icon: 'pi pi-sliders-h' },
    { label: 'Reportes',     path: '/reportes',             icon: 'pi pi-file-excel' }
  ];

  readonly adminItems: MenuItem[] = [
    { label: 'Empleados',  path: '/empleados',  icon: 'pi pi-id-card' },
    { label: 'Roles',      path: '/roles',      icon: 'pi pi-shield' },
    { label: 'Auditoría',  path: '/auditoria',  icon: 'pi pi-history' }
  ];

  visibleItems: MenuItem[] = [];

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.authService.permisos$.subscribe(() => {
      this.visibleItems = this.allItems.filter(item => this.authService.canReadPath(item.path));
    });
  }
}
