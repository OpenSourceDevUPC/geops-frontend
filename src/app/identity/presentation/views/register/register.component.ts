import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../infrastructure/auth/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcher } from '../../../../shared/presentation/components/language-switcher/language-switcher';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule, TranslateModule, LanguageSwitcher,
    MatButtonToggleModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.model.name || !this.model.email || !this.model.password || !this.model.role) {
      this.errorMessage = 'Completa todos los campos requeridos';
      this.registering = false;
      return;
    }

    this.registering = true;
    this.errorMessage = '';

    // Si no es OWNER, eliminar datos de negocio
    if (this.model.role !== 'OWNER') {
      delete this.model.business;
    }

    // Crear payload sin ID
    const payload = { ...this.model };
    delete payload.id;

    // USAR AuthService que guarda el usuario automáticamente
    this.authService.register(payload).subscribe({
      next: (user) => {
        console.log('[Register] Usuario registrado con ID:', user.id);

        if (this.model.role === 'OWNER') {
          localStorage.setItem('register-owner-email', this.model.email);
          this.router.navigate(['/register-bussines']);
        } else {
          this.router.navigate(['/home']);
        }
        this.registering = false;
      },
      error: (err) => {
        console.error('[Register] Error:', err);
        this.errorMessage = 'Error al registrar usuario. El email puede estar en uso.';
        this.registering = false;
      }
    });
  }
}
