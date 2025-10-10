import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../infrastructure/auth/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcher } from '../../../../shared/presentation/components/language-switcher/language-switcher';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

/**
 * LoginComponent handles user authentication via email and password.
 * Displays error messages and manages loading state during login.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule, TranslateModule, LanguageSwitcher,
    MatButtonToggleModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  /** Model for login form fields */
  model: any = { email: '', password: '' };
  /** Indicates if login request is in progress */
  loading = false;
  /** Stores error messages for display */
  errorMessage = '';

  /**
   * Initializes LoginComponent with AuthService and Router.
   * @param authService Service for authentication operations
   * @param router Angular Router for navigation
   */
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Handles login form submission.
   * Validates input, performs login, and navigates on success.
   */
  onSubmit() {
    if (!this.model.email || !this.model.password) {
      this.errorMessage = 'Please complete all fields to log in';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.model.email, this.model.password).subscribe({
      next: (user) => {
        if (user) {
          console.log('[Login] Authenticated user with ID:', user.id);
          this.router.navigate(['/home']);
        } else {
          this.errorMessage = 'Incorrect email or password';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('[Login] Error:', err);
        this.errorMessage = 'Login error';
        this.loading = false;
      }
    });
  }
}
