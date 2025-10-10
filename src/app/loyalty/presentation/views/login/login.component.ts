import { Component } from '@angular/core';
import { UsersApiEndpoint } from '../../../infrastructure/users-api-endpoint';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  model: any = { email: '', password: '' };
  loading = false;
  errorMessage = '';

  constructor(private usersApi: UsersApiEndpoint, private router: Router) {}

  onSubmit() {
    // Seguridad extra: revisa los campos antes de enviar al API
    if (!this.model.email || !this.model.password) {
      this.errorMessage = 'Completa todos los campos para iniciar sesión';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.usersApi.login(this.model.email, this.model.password).subscribe({
      next: (user) => {
        if (user) {
          // Usuario encontrado: navega a home
          this.router.navigate(['/home']);
        } else {
          // Usuario no existe
          this.errorMessage = 'Email o contraseña incorrectos';
        }
        this.loading = false;
      },
      error: err => {
        this.errorMessage = 'Error en el login';
        this.loading = false;
      }
    });
  }
}
