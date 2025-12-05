import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CampaignService } from '../../services/campaign.service';
import { Campaign, CampaignStatus } from '../../../domain/model/campaign.entity';
import { AuthService } from '../../../../identity/infrastructure/auth/auth.service';
import { ConfirmDialogComponent } from '../../../../shared/presentation/components/confirm-dialog/confirm-dialog.component';

/**
 * ResumenComponent
 *
 * Dashboard summary view showing campaign overview and statistics.
 * Displays all campaigns with their metrics and action buttons.
 */
@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule, MatDialogModule, MatSnackBarModule],
  templateUrl: './resumen.component.html',
  styleUrls: ['./resumen.component.css']
})
export class ResumenComponent implements OnInit {
  private readonly campaignService = inject(CampaignService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  campaigns: Campaign[] = [];
  totalImpressions = 0;
  totalClicks = 0;
  averageCTR = 0;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // Get current user ID and load campaigns
    const userId = this.authService.getCurrentUserId();

    if (userId) {
      console.log('[Resumen] Loading campaigns for user:', userId);
      this.campaignService.loadCampaignsByUserId(userId);
    } else {
      console.warn('[Resumen] No authenticated user found');
    }

    // Subscribe to campaigns changes
    this.campaignService.campaigns$.subscribe(campaigns => {
      this.campaigns = campaigns;
      this.calculateMetrics();
    });
  }

  private calculateMetrics(): void {
    this.totalImpressions = this.campaigns.reduce((sum, c) => sum + (c.totalImpressions || 0), 0);
    this.totalClicks = this.campaigns.reduce((sum, c) => sum + (c.totalClicks || 0), 0);

    // Calculate average CTR safely
    if (this.campaigns.length > 0) {
      const validCTRs = this.campaigns
        .map((c) => c.CTR || 0)
        .filter((ctr) => !isNaN(ctr) && isFinite(ctr));

      this.averageCTR = validCTRs.length > 0
        ? validCTRs.reduce((sum, ctr) => sum + ctr, 0) / validCTRs.length
        : 0;
    } else {
      this.averageCTR = 0;
    }
  }

  /**
   * Get badge color based on campaign status
   */
  getStatusColor(status: CampaignStatus): string {
    switch (status) {
      case 'ACTIVE':
        return '#4CAF50';
      case 'INACTIVE':
        return '#FFC107';
      case 'EXPIRED':
        return '#9E9E9E';
      default:
        return '#2196F3';
    }
  }

  /**
   * Get user-friendly status label
   */
  getStatusLabel(status: CampaignStatus): string {
    switch (status) {
      case 'ACTIVE':
        return 'Activa';
      case 'INACTIVE':
        return 'Pausada';
      case 'EXPIRED':
        return 'Finalizada';
      default:
        return status;
    }
  }

  /**
   * View campaign details (read-only)
   */
  onView(campaignId: number): void {
    console.log('[Resumen] Viewing campaign:', campaignId);
    this.router.navigate(['/ver-campaña', campaignId]);
  }

  /**
   * Edit campaign
   */
  onEdit(campaignId: number): void {
    console.log('[Resumen] Editing campaign:', campaignId);
    this.router.navigate(['/editar-campaña', campaignId]);
  }

  /**
   * Toggle campaign active/inactive status
   */
  onToggleStatus(campaignId: number): void {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const newStatus: CampaignStatus = campaign.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const actionText = newStatus === 'ACTIVE' ? 'activar' : 'pausar';

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `¿${actionText.charAt(0).toUpperCase() + actionText.slice(1)} campaña?`,
        message: `¿Estás seguro de que deseas ${actionText} la campaña "${campaign.name}"?`,
        confirmText: actionText.charAt(0).toUpperCase() + actionText.slice(1),
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.campaignService.updateCampaign(campaignId, { status: newStatus }).subscribe({
          next: () => {
            this.snackBar.open(`Campaña ${actionText === 'activar' ? 'activada' : 'pausada'} exitosamente`, 'Cerrar', { duration: 3000 });
            this.loadData();
          },
          error: (err) => {
            console.error('[Resumen] Error toggling status:', err);
            this.snackBar.open('Error al cambiar el estado de la campaña', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }

  /**
   * Delete campaign with confirmation
   */
  onDelete(campaignId: number): void {
    const campaign = this.campaigns.find(c => c.id === campaignId);
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
        this.campaignService.deleteCampaign(campaignId).subscribe({
          next: () => {
            this.snackBar.open('Campaña eliminada exitosamente', 'Cerrar', { duration: 3000 });
            this.loadData();
          },
          error: (err) => {
            console.error('[Resumen] Error deleting campaign:', err);
            this.snackBar.open('Error al eliminar la campaña', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }
}
