import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcher } from '../../../../shared/presentation/components/language-switcher/language-switcher';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { AuthService } from '../../../infrastructure/auth/auth.service';
import { UserDetailsService } from '../../../infrastructure/auth/user-details.service';
import { DetailsSupplier } from '../../../domain/model/user.entity';

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
    taxId: '',
    website: '',
    description: '',
    address: '',
    horarioAtencion: ''
  };
  /** Indicates if submission is in progress */
  submitting = false;
  /** Stores error messages for display */
  errorMessage = '';

  /**
   * Initializes RegisterBussinesComponent with services
   * @param router Angular Router for navigation
   * @param authService Service for authentication
   * @param userDetailsService Service for managing user details
   */
  constructor(
    private router: Router,
    private authService: AuthService,
    private userDetailsService: UserDetailsService
  ) {}

  /**
   * Handles business registration form submission.
   * Creates supplier details for the current owner user.
   */
  onSubmit() {
    if (!this.business.businessName || !this.business.businessType || !this.business.taxId) {
      this.errorMessage = 'Please complete all required fields (Business Name, Type, and Tax ID)';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.errorMessage = 'No authenticated user found. Please login first.';
      this.submitting = false;
      return;
    }

    if (currentUser.role !== 'OWNER') {
      this.errorMessage = 'Only OWNER users can register business details.';
      this.submitting = false;
      return;
    }

    // Create supplier details
    const supplierDetails: DetailsSupplier = {
      businessName: this.business.businessName,
      businessType: this.business.businessType,
      taxId: this.business.taxId,
      website: this.business.website || undefined,
      description: this.business.description || undefined,
      address: this.business.address || undefined,
      horarioAtencion: this.business.horarioAtencion || undefined
    };

    console.log('[RegisterBusiness] Creating supplier details:', supplierDetails);

    this.userDetailsService.createSupplierDetails(supplierDetails, currentUser.id).subscribe({
      next: (created) => {
        console.log('[RegisterBusiness] Supplier details created:', created);

        // Update current user with new details
        this.authService.refreshCurrentUser().subscribe({
          next: () => {
            this.submitting = false;
            // Clean up temporary storage
            localStorage.removeItem('register-owner-email');
            // Navigate to dashboard/home
            this.router.navigate(['/home']);
          },
          error: (err) => {
            console.error('[RegisterBusiness] Error refreshing user:', err);
            // Navigate anyway since details were created
            this.submitting = false;
            localStorage.removeItem('register-owner-email');
            this.router.navigate(['/home']);
          }
        });
      },
      error: (err) => {
        console.error('[RegisterBusiness] Error creating supplier details:', err);
        this.errorMessage = 'Error saving business details. Please try again.';
        this.submitting = false;
      }
    });
  }
}
