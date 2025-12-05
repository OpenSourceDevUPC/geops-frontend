import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { CampaignService } from '../../services/campaign.service';
import { Campaign } from '../../../domain/model/campaign.entity';
import { AuthService } from '../../../../identity/infrastructure/auth/auth.service';
import { ConfirmDialogComponent } from '../../../../shared/presentation/components/confirm-dialog/confirm-dialog.component';
import { CampaignApiEndpoint } from '../../../infrastructure/campaign-api-endpoint';
import { CampaignCartCleanupService } from '../../../infrastructure/campaign-cart-cleanup.service';

/**
 * CampaignsComponent
 *
 * Main view for managing campaigns (Owner role).
 * Displays campaigns grouped by status: Active, Paused, Finished
 * Integrates with Campaign API for real-time data.
 */
@Component({
  selector: 'app-campaigns',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './campaigns.component.html',
  styleUrls: ['./campaigns.component.css']
})
export class CampaignsComponent implements OnInit, OnDestroy {
  private readonly campaignService = inject(CampaignService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly campaignApiEndpoint = inject(CampaignApiEndpoint);
  private readonly cartCleanupService = inject(CampaignCartCleanupService);
  private destroy$ = new Subject<void>();

  selectedTabIndex = 0;
  campaigns: Campaign[] = [];
  loading = false;
  error: string | null = null;

  /** Campaigns grouped by status */
  get activeCampaigns(): Campaign[] {
    return this.campaigns.filter(c => c.status === 'ACTIVE');
  }

  get pausedCampaigns(): Campaign[] {
    return this.campaigns.filter(c => c.status === 'PAUSED');
  }

  get finishedCampaigns(): Campaign[] {
    return this.campaigns.filter(c => c.status === 'FINALIZED');
  }

  ngOnInit(): void {
    this.loadCampaigns();

    // Subscribe to campaign updates
    this.campaignService.campaigns$
      .pipe(takeUntil(this.destroy$))
      .subscribe(campaigns => {
        this.campaigns = campaigns;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load campaigns for current user
   */
  loadCampaigns(): void {
    this.loading = true;
    this.error = null;

    // Get user ID from storage (adjust according to your auth implementation)
    const userId = this.getUserId();

    this.campaignService.loadCampaignsByUserId(userId);
    this.loading = false;
  }

  /**
   * Get status color badge
   */
  getStatusColor(status: string): string {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return '#4CAF50';
      case 'PAUSED':
        return '#FFC107';
      case 'FINALIZED':
        return '#9E9E9E';
      default:
        return '#2196F3';
    }
  }

  /**
   * Get campaigns for selected tab
   */
  getSelectedCampaigns(): Campaign[] {
    switch (this.selectedTabIndex) {
      case 0:
        return this.activeCampaigns;
      case 1:
        return this.pausedCampaigns;
      case 2:
        return this.finishedCampaigns;
      default:
        return [];
    }
  }

  /**
   * Navigate to edit campaign
   */
  onEdit(campaignId: number): void {
    this.router.navigate(['/editar-campaña', campaignId]);
  }

  /**
   * Pause campaign (change status to PAUSED)
   * Removes associated offers from all user carts
   */
  onPause(campaignId: number): void {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: '¿Pausar campaña?',
        message: `¿Estás seguro de que deseas pausar la campaña "${campaign.name}"? Las ofertas asociadas se eliminarán de todos los carritos.`,
        confirmText: 'Pausar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.updateCampaignStatusAndClearCarts(campaignId, campaign, 'PAUSED', 'pausada');
      }
    });
  }

  /**
   * Activate campaign (change status to ACTIVE)
   */
  onActivate(campaignId: number): void {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: '¿Activar campaña?',
        message: `¿Estás seguro de que deseas activar la campaña "${campaign.name}"?`,
        confirmText: 'Activar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.loading = true;

        // Send all required fields for PATCH
        const updates = {
          name: campaign.name,
          description: campaign.description,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          estimatedBudget: campaign.estimatedBudget,
          status: 'ACTIVE' as const,
          totalImpressions: campaign.totalImpressions,
          totalClicks: campaign.totalClicks,
          CTR: campaign.CTR
        };

        this.campaignService.updateCampaign(campaignId, updates).subscribe({
          next: () => {
            this.snackBar.open('Campaña activada exitosamente', 'Cerrar', { duration: 3000 });
            this.loadCampaigns();
            this.loading = false;
          },
          error: (err) => {
            console.error('[Campaigns] Error activating campaign:', err);
            this.snackBar.open('Error al activar la campaña', 'Cerrar', { duration: 3000 });
            this.loading = false;
          }
        });
      }
    });
  }

  /**
   * Finalize campaign (change status to FINALIZED)
   * Removes associated offers from all user carts
   */
  onFinalize(campaignId: number): void {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: '¿Finalizar campaña?',
        message: `¿Estás seguro de que deseas finalizar la campaña "${campaign.name}"? Esta acción eliminará las ofertas asociadas de todos los carritos y no se podrá reactivar.`,
        confirmText: 'Finalizar',
        cancelText: 'Cancelar',
        isDanger: true
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.updateCampaignStatusAndClearCarts(campaignId, campaign, 'FINALIZED', 'finalizada');
      }
    });
  }

  /**
   * Resume/Edit campaign (change status to ACTIVE) - For paused campaigns
   */
  onResumeEdit(campaignId: number): void {
    this.onActivate(campaignId);
  }

  /**
   * Delete campaign with confirmation
   * Removes associated offers from all user carts
   */
  onDelete(campaignId: number): void {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: '¿Eliminar campaña?',
        message: `¿Estás seguro de que deseas eliminar la campaña "${campaign.name}"? Esta acción no se puede deshacer y eliminará las ofertas asociadas de todos los carritos.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        isDanger: true
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.loading = true;

        // First, get all offers from this campaign and remove from carts
        this.removeOffersFromAllCarts(campaignId).subscribe({
          next: () => {
            // Then delete the campaign
            this.campaignService.deleteCampaign(campaignId).subscribe({
              next: () => {
                this.snackBar.open('Campaña eliminada exitosamente', 'Cerrar', { duration: 3000 });
                this.loadCampaigns();
                this.loading = false;
              },
              error: (err) => {
                console.error('[Campaigns] Error deleting campaign:', err);
                this.snackBar.open('Error al eliminar la campaña', 'Cerrar', { duration: 3000 });
                this.loading = false;
              }
            });
          },
          error: (err) => {
            console.error('[Campaigns] Error removing offers from carts:', err);
            this.snackBar.open('Error al limpiar carritos', 'Cerrar', { duration: 3000 });
            this.loading = false;
          }
        });
      }
    });
  }

  /**
   * Update campaign status and clear associated offers from all carts
   */
  private updateCampaignStatusAndClearCarts(
    campaignId: number,
    campaign: Campaign,
    newStatus: 'PAUSED' | 'FINALIZED',
    actionText: string
  ): void {
    this.loading = true;

    // First, remove offers from all carts
    this.removeOffersFromAllCarts(campaignId).subscribe({
      next: () => {
        // Then update campaign status with all required fields
        const updates = {
          name: campaign.name,
          description: campaign.description,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          estimatedBudget: campaign.estimatedBudget,
          status: newStatus,
          totalImpressions: campaign.totalImpressions,
          totalClicks: campaign.totalClicks,
          CTR: campaign.CTR
        };

        this.campaignService.updateCampaign(campaignId, updates).subscribe({
          next: () => {
            this.snackBar.open(`Campaña ${actionText} exitosamente`, 'Cerrar', { duration: 3000 });
            this.loadCampaigns();
            this.loading = false;
          },
          error: (err) => {
            console.error(`[Campaigns] Error updating campaign to ${newStatus}:`, err);
            this.snackBar.open(`Error al ${actionText.slice(0, -1)} la campaña`, 'Cerrar', { duration: 3000 });
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('[Campaigns] Error removing offers from carts:', err);
        this.snackBar.open('Error al limpiar carritos', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  /**
   * Remove all offers associated with a campaign from all user carts
   * Delegates to infrastructure service for reusability
   */
  private removeOffersFromAllCarts(campaignId: number) {
    return this.cartCleanupService.removeOffersFromAllCarts(campaignId);
  }

  /**
   * Get user ID from authentication service
   */
  private getUserId(): number {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('No authenticated user found');
    }
    return userId;
  }
}
