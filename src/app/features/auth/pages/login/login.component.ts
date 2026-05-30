import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { AlertMessageComponent } from '../../../../shared/components/alert-message/alert-message.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [AlertMessageComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  isLoading = false;
  errorMessage = '';
  showPassword = false;

  readonly form = this.formBuilder.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.authService
      .login(this.form.getRawValue())
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          const user = this.authService.getCurrentUser();
          if (user?.mustChangePassword) {
            this.router.navigate(['/cambiar-contrasena']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: () => (this.errorMessage = 'Usuario o contraseña incorrectos.')
      });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
