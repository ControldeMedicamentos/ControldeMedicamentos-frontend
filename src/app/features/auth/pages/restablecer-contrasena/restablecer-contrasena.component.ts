import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-restablecer-contrasena',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './restablecer-contrasena.component.html'
})
export class RestablecerContrasenaComponent implements OnInit {
  private readonly api    = inject(ApiService);
  private readonly route  = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb     = inject(FormBuilder);

  token = '';
  nombre = '';
  isLoading    = false;
  isLoadingInfo = true;
  isDone       = false;
  errorMsg     = '';
  showNew      = false;
  showConfirm  = false;

  readonly form = this.fb.nonNullable.group({
    newPassword:     ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  });

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.isLoadingInfo = false;
      this.errorMsg = 'Enlace inválido. Solicita un nuevo registro al administrador.';
      return;
    }
    this.api.get<{ nombre: string }>('/auth/reset-info', { token: this.token })
      .pipe(finalize(() => (this.isLoadingInfo = false)))
      .subscribe({
        next: (res) => (this.nombre = res.nombre),
        error: () => (this.errorMsg = 'El enlace no es válido o ha expirado.')
      });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { newPassword, confirmPassword } = this.form.getRawValue();
    if (newPassword !== confirmPassword) {
      this.errorMsg = 'Las contraseñas no coinciden.';
      return;
    }
    this.isLoading = true;
    this.errorMsg  = '';
    this.api.post<void, { token: string; newPassword: string }>(
      '/auth/reset-password',
      { token: this.token, newPassword }
    ).pipe(finalize(() => (this.isLoading = false)))
    .subscribe({
      next: () => (this.isDone = true),
      error: (err) => {
        this.errorMsg = err?.error?.message ?? 'El enlace no es válido o ha expirado.';
      }
    });
  }

  irAlLogin(): void {
    this.router.navigate(['/login']);
  }
}
