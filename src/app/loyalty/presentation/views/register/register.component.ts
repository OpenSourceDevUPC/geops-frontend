import { Component } from '@angular/core';
import { UsersApiEndpoint } from '../../../infrastructure/users-api-endpoint';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  model: any = {
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'CONSUMER',
    plan: 'BASIC',
    business: {}
  };
  registering = false;
  errorMessage = '';

  constructor(private usersApi: UsersApiEndpoint, private router: Router) {}

  onSubmit() {
    if (!this.model.name || !this.model.email || !this.model.password || !this.model.role) {
      this.errorMessage = 'Completa todos los campos requeridos';
      this.registering = false;
      return;
    }
    this.registering = true;
    this.errorMessage = '';
    if (this.model.role !== 'OWNER') {
      delete this.model.business;
    }

    // Clone model y elimina id SI existía:
    const payload = { ...this.model };
    delete payload.id; // Esto es lo nuevo y CLAVE

    this.usersApi.register(payload).subscribe({
      next: () => {
        if (this.model.role === 'OWNER') {
          // Guarda el email para identificar después al usuario en la pantalla de negocio
          localStorage.setItem('register-owner-email', this.model.email);
          this.router.navigate(['/register-bussines']);
        } else {
          this.router.navigate(['/home']);
        }
        this.registering = false;
      },
      error: err => {
        this.errorMessage = 'Error al registrar usuario';
        this.registering = false;
      }
    });
  }
}
