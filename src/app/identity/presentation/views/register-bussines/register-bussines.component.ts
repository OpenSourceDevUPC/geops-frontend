import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcher } from '../../../../shared/presentation/components/language-switcher/language-switcher';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { environment } from '../../../../../environments/environment';

/**
 * RegisterBussinesComponent handles business profile registration for OWNER users.
 * Submits business data and updates the user profile.
 */
@Component({
  selector: 'app-register-bussines',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, LanguageSwitcher,
    MatButtonToggleModule],
  templateUrl: './register-bussines.component.html',
  styleUrls: ['./register-bussines.component.css']
})
export class RegisterBussinesComponent {
  /** Model for business registration form fields */
  business: any = {
    businessName: '',
    businessType: '',
    taxId: ''
  };
  /** Indicates if submission is in progress */
  submitting = false;
  /** Stores error messages for display */
  errorMessage = '';

  /**
   * Initializes RegisterBussinesComponent with Router and HttpClient.
   * @param router Angular Router for navigation
   * @param http Angular HttpClient for HTTP requests
   */
  constructor(private router: Router, private http: HttpClient) {}

  /**
   * Handles business registration form submission.
   * Finds the user by email, updates business data, and navigates on success.
   */
  onSubmit() {
    this.submitting = true;
    const email = localStorage.getItem('register-owner-email');
    this.http.get<any[]>(`${environment.platformProviderApiBaseUrl}/users?email=${email}`).subscribe({
      next: (users) => {
        if (!users.length) {
          this.errorMessage = 'User not found';
          this.submitting = false;
          return;
        }
        const user = users[0];
        const id = user.id;
        this.http.patch(`${environment.platformProviderApiBaseUrl}/users/${id}`, {
          business: this.business
        }).subscribe({
          next: () => {
            this.submitting = false;
            this.router.navigate(['/home']);
          },
          error: err => {
            this.errorMessage = 'Error saving business';
            this.submitting = false;
          }
        });
      },
      error: err => {
        this.errorMessage = 'Error searching for user';
        this.submitting = false;
      }
    });
  }
}
