import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CampaignService } from '../../services/campaign.service';
import { Campaign } from '../../../domain/model/campaign.entity';

/**
 * EditCampaignComponent
 *
 * Form for editing existing campaigns.
 * Loads campaign data and allows updates.
 */
@Component({
  selector: 'app-edit-campaign',
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
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './edit-campaign.component.html',
  styleUrls: ['./edit-campaign.component.css']
})
export class EditCampaignComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly campaignService = inject(CampaignService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  campaignForm: FormGroup;
  loading = false;
  error: string | null = null;
  campaignId: number = 0;
  campaign: Campaign | null = null;

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

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.campaignId = +params['id'];
      this.loadCampaign();
    });
  }

  loadCampaign(): void {
    this.loading = true;
    this.campaignService.loadCampaignById(this.campaignId);

    this.campaignService.selectedCampaign$.subscribe(campaign => {
      if (campaign && campaign.id === this.campaignId) {
        this.campaign = campaign;
        this.populateForm(campaign);
        this.loading = false;
      }
    });
  }

  populateForm(campaign: Campaign): void {
    this.campaignForm.patchValue({
      name: campaign.name,
      description: campaign.description,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      estimatedBudget: campaign.estimatedBudget,
      status: campaign.status
    });
  }

  onSubmit(): void {
    if (this.campaignForm.valid) {
      this.loading = true;
      this.error = null;

      const updates: Partial<Campaign> = {
        ...this.campaignForm.value
      };

      this.campaignService.updateCampaign(this.campaignId, updates).subscribe({
        next: (updatedCampaign) => {
          this.snackBar.open('Campaña actualizada exitosamente', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/campañas']);
        },
        error: (err) => {
          this.error = 'Error al actualizar campaña';
          this.loading = false;
          this.snackBar.open('Error al actualizar campaña', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/campañas']);
  }
}
