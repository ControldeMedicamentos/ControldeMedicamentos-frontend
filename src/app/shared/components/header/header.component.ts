import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);

  readonly user = this.authService.getCurrentUser();

  logout(): void {
    this.authService.logout();
  }
}
