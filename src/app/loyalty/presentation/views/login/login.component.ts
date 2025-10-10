// src/app/loyalty/presentation/views/login/login.component.ts
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../infrastructure/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  model: any = { email: '', password: '' };
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.model.email || !this.model.password) {
      this.errorMessage = 'Completa todos los campos para iniciar sesión';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.model.email, this.model.password).subscribe({
      next: (user) => {
        if (user) {
          console.log('[Login] Usuario autenticado con ID:', user.id);
          this.router.navigate(['/home']);
        } else {
          this.errorMessage = 'Email o contraseña incorrectos';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('[Login] Error:', err);
        this.errorMessage = 'Error en el login';
        this.loading = false;
      }
    });
  }
}
