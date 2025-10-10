import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../infrastructure/auth/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcher } from '../../../../shared/presentation/components/language-switcher/language-switcher';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

/**
 * RegisterComponent handles user registration.
 * Manages form state, validation, and navigation after registration.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule, TranslateModule, LanguageSwitcher,
    MatButtonToggleModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  /** Model for registration form fields */
  model: any = {
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'CONSUMER',
    plan: 'BASIC',
    business: {}
  };
  /** Indicates if registration is in progress */
  registering = false;
  /** Stores error messages for display */
  errorMessage = '';

  /**
   * Initializes RegisterComponent with AuthService and Router.
   * @param authService Service for user registration
   * @param router Angular Router for navigation
   */
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Handles registration form submission.
   * Validates input, processes registration, and navigates on success.
   */
  onSubmit() {
    if (!this.model.name || !this.model.email || !this.model.password || !this.model.role) {
      this.errorMessage = 'Please complete all required fields';
      this.registering = false;
      return;
    }

    this.registering = true;
    this.errorMessage = '';

    // Remove business data if not OWNER
    if (this.model.role !== 'OWNER') {
      delete this.model.business;
    }

    // Create payload without ID
    const payload = { ...this.model };
    delete payload.id;

    // Use AuthService to register and save user automatically
    this.authService.register(payload).subscribe({
      next: (user) => {
        console.log('[Register] Registered user with ID:', user.id);

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
        this.errorMessage = 'Registration error. The email may already be in use.';
        this.registering = false;
      }
    });
  }
}
