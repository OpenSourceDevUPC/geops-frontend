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
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CampaignService } from '../../services/campaign.service';
import { Campaign } from '../../../domain/model/campaign.entity';
import { CampaignOffer } from '../../../domain/model/offer.entity';
import { CampaignOffersListComponent } from '../../components/campaign-offers-list/campaign-offers-list.component';
import { AddOfferFormComponent } from '../../components/add-offer-form/add-offer-form.component';
import { ConfirmDialogComponent } from '../../../../shared/presentation/components/confirm-dialog/confirm-dialog.component';

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
    MatSnackBarModule,
    MatTabsModule,
    MatDialogModule,
    CampaignOffersListComponent,
    AddOfferFormComponent
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
  private readonly dialog = inject(MatDialog);

  campaignForm: FormGroup;
  loading = false;
  error: string | null = null;
  campaignId: number = 0;
  campaign: Campaign | null = null;
  offers: CampaignOffer[] = [];
  showOfferForm: boolean = false;
  editingOffer: CampaignOffer | undefined = undefined;

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
      this.loadOffers();
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

  loadOffers(): void {
    this.campaignService.loadOffersByCampaignId(this.campaignId);
    this.campaignService.campaignOffers$.subscribe(offers => {
      this.offers = offers;
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
    this.router.navigate(['/resumen']);
  }

  // ==================== OFFER MANAGEMENT ====================

  onShowOfferForm(): void {
    this.showOfferForm = true;
    this.editingOffer = undefined;
  }

  onHideOfferForm(): void {
    this.showOfferForm = false;
    this.editingOffer = undefined;
  }

  onSaveOffer(offerData: Partial<CampaignOffer>): void {
    if (this.editingOffer && this.editingOffer.id) {
      // Update existing offer
      this.campaignService.updateOffer(this.editingOffer.id, offerData).subscribe({
        next: () => {
          this.snackBar.open('Oferta actualizada exitosamente', 'Cerrar', { duration: 3000 });
          this.loadOffers();
          this.onHideOfferForm();
        },
        error: (err) => {
          console.error('[EditCampaign] Error updating offer:', err);
          this.snackBar.open('Error al actualizar oferta', 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      // Create new offer
      this.campaignService.createOffer(offerData).subscribe({
        next: () => {
          this.snackBar.open('Oferta agregada exitosamente', 'Cerrar', { duration: 3000 });
          this.loadOffers();
          this.onHideOfferForm();
        },
        error: (err) => {
          console.error('[EditCampaign] Error creating offer:', err);
          this.snackBar.open('Error al agregar oferta', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  onEditOffer(offer: CampaignOffer): void {
    this.editingOffer = offer;
    this.showOfferForm = true;
  }

  onDeleteOffer(offerId: number): void {
    const offer = this.offers.find(o => o.id === offerId);
    if (!offer) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: '¿Eliminar oferta?',
        message: `¿Estás seguro de que deseas eliminar la oferta "${offer.title}"? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        isDanger: true
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.campaignService.deleteOffer(offerId).subscribe({
          next: () => {
            this.snackBar.open('Oferta eliminada exitosamente', 'Cerrar', { duration: 3000 });
            this.loadOffers();
          },
          error: (err) => {
            console.error('[EditCampaign] Error deleting offer:', err);
            this.snackBar.open('Error al eliminar oferta', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }
}
