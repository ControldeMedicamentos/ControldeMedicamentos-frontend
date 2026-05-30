import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthResponse } from '../../../../models/auth.model';
import { ApiService } from '../../../../core/services/api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AlertMessageComponent } from '../../../../shared/components/alert-message/alert-message.component';

@Component({
  selector: 'app-cambiar-contrasena',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertMessageComponent],
  templateUrl: './cambiar-contrasena.component.html',
  styleUrl: './cambiar-contrasena.component.scss'
})
export class CambiarContrasenaComponent {
  private readonly api = inject(ApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  isLoading = false;
  errorMessage = '';
  showCurrent = false;
  showNew = false;
  showConfirm = false;

  readonly form = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword:     ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  });

  get nombreUsuario(): string {
    return this.authService.getCurrentUser()?.nombre ?? 'Empleado';
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { currentPassword, newPassword, confirmPassword } = this.form.getRawValue();
    if (newPassword !== confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.api.patch<AuthResponse, { currentPassword: string; newPassword: string }>(
      '/auth/change-password',
      { currentPassword, newPassword }
    ).pipe(finalize(() => (this.isLoading = false)))
    .subscribe({
      next: (response) => {
        localStorage.setItem('control_medicamentos_token', response.token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message ?? 'Error al cambiar la contraseña.';
      }
    });
  }
}
