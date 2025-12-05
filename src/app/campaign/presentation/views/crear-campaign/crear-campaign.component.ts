import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { CampaignService } from '../../services/campaign.service';
import { Campaign } from '../../../domain/model/campaign.entity';
import { AuthService } from '../../../../identity/infrastructure/auth/auth.service';

/**
 * CreateCampaignComponent
 *
 * Form for creating new campaigns.
 * Includes validation and API integration.
 */
@Component({
  selector: 'app-crear-campaign',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  templateUrl: './crear-campaign.component.html',
  styleUrls: ['./crear-campaign.component.css']
})
export class CrearCampaignComponent {
  private readonly fb = inject(FormBuilder);
  private readonly campaignService = inject(CampaignService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  campaignForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor() {
    this.campaignForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      estimatedBudget: [0, [Validators.required, Validators.min(0)]],
      status: ['INACTIVE', Validators.required]
    });
  }

  onSubmit(): void {
    if (!this.loading) {
      this.loading = true;
      this.error = null;

      const campaign: Partial<Campaign> = {
        ...this.campaignForm.value,
        userId: this.getUserId(), // Get from auth service
        totalImpressions: 0,
        totalClicks: 0,
        ctr: 0
      };

      this.campaignService.createCampaign(campaign).subscribe({
        next: () => {
          this.router.navigate(['/campañas']);
        },
        error: (err) => {
          this.error = 'Error al crear campaña';
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/campañas']);
  }

  private getUserId(): number {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('No authenticated user found');
    }
    return userId;
  }
}
