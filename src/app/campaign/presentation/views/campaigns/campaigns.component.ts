import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CampaignStore } from '../../../application/campaign.store';
import { Campaign } from '../../../domain/model/campaign.entity';
import { AuthService } from '../../../../identity/infrastructure/auth/auth.service';
import { ConfirmDialogComponent } from '../../../../shared/presentation/components/confirm-dialog/confirm-dialog.component';
import { CampaignApiEndpoint } from '../../../infrastructure/campaign-api-endpoint';

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
export class CampaignsComponent implements OnInit {
  private readonly store = inject(CampaignStore);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly campaignApiEndpoint = inject(CampaignApiEndpoint);

  selectedTabIndex = 0;
  campaigns = this.store.campaigns;
  loading = this.store.loading;
  error = this.store.error;

  /** Campaigns grouped by status */
  get activeCampaigns(): Campaign[] {
    return this.campaigns().filter(c => c.status === 'ACTIVE');
  }

  get pausedCampaigns(): Campaign[] {
    return this.campaigns().filter(c => c.status === 'PAUSED');
  }

  get finishedCampaigns(): Campaign[] {
    return this.campaigns().filter(c => c.status === 'FINALIZED');
  }

  ngOnInit(): void {
    this.loadCampaigns();
  }

  /**
   * Load campaigns for current user
   */
  loadCampaigns(): void {
    const userId = this.getUserId();
    this.store.loadCampaignsByUserId(userId);
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
   */
  onPause(campaignId: number): void {
    const campaign = this.campaigns().find(c => c.id === campaignId);
    if (!campaign) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: '¿Pausar campaña?',
        message: `¿Estás seguro de que deseas pausar la campaña "${campaign.name}"?`,
        confirmText: 'Pausar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        const updates = {
          name: campaign.name,
          description: campaign.description,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          estimatedBudget: campaign.estimatedBudget,
          status: 'PAUSED' as const,
          totalImpressions: campaign.totalImpressions,
          totalClicks: campaign.totalClicks,
          CTR: campaign.CTR
        };
        this.store.updateCampaign(campaignId, updates);
        this.snackBar.open('Campaña pausada exitosamente', 'Cerrar', { duration: 3000 });
      }
    });
  }

  /**
   * Activate campaign (change status to ACTIVE)
   */
  onActivate(campaignId: number): void {
    const campaign = this.campaigns().find(c => c.id === campaignId);
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
        this.store.updateCampaign(campaignId, updates);
        this.snackBar.open('Campaña activada exitosamente', 'Cerrar', { duration: 3000 });
      }
    });
  }

  /**
   * Finalize campaign (change status to FINALIZED)
   */
  onFinalize(campaignId: number): void {
    const campaign = this.campaigns().find(c => c.id === campaignId);
    if (!campaign) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: '¿Finalizar campaña?',
        message: `¿Estás seguro de que deseas finalizar la campaña "${campaign.name}"? Esta acción no se podrá revertir.`,
        confirmText: 'Finalizar',
        cancelText: 'Cancelar',
        isDanger: true
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        const updates = {
          name: campaign.name,
          description: campaign.description,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          estimatedBudget: campaign.estimatedBudget,
          status: 'FINALIZED' as const,
          totalImpressions: campaign.totalImpressions,
          totalClicks: campaign.totalClicks,
          CTR: campaign.CTR
        };
        this.store.updateCampaign(campaignId, updates);
        this.snackBar.open('Campaña finalizada exitosamente', 'Cerrar', { duration: 3000 });
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
   */
  onDelete(campaignId: number): void {
    const campaign = this.campaigns().find(c => c.id === campaignId);
    if (!campaign) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: '¿Eliminar campaña?',
        message: `¿Estás seguro de que deseas eliminar la campaña "${campaign.name}"? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        isDanger: true
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.store.deleteCampaign(campaignId);
        this.snackBar.open('Campaña eliminada exitosamente', 'Cerrar', { duration: 3000 });
      }
    });
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
