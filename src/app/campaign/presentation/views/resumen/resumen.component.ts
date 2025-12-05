import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { CampaignService } from '../../services/campaign.service';
import { Campaign, CampaignStatus } from '../../../domain/model/campaign.entity';
import { AuthService } from '../../../../identity/infrastructure/auth/auth.service';

/**
 * ResumenComponent
 *
 * Dashboard summary view showing campaign overview and statistics.
 * Displays all campaigns with their metrics and action buttons.
 */
@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './resumen.component.html',
  styleUrls: ['./resumen.component.css']
})
export class ResumenComponent implements OnInit {
  private readonly campaignService = inject(CampaignService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

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
   * View campaign details
   */
  onView(campaignId: number): void {
    console.log('[Resumen] Viewing campaign:', campaignId);
    // TODO: Navigate to campaign detail view
    // this.router.navigate(['/campaigns', campaignId]);
  }

  /**
   * Edit campaign
   */
  onEdit(campaignId: number): void {
    console.log('[Resumen] Editing campaign:', campaignId);
    // TODO: Navigate to campaign edit view
    // this.router.navigate(['/campaigns', campaignId, 'edit']);
  }

  /**
   * Toggle campaign active/inactive status
   */
  onToggleStatus(campaignId: number): void {
    console.log('[Resumen] Toggling status for campaign:', campaignId);
    // TODO: Implement status toggle
    // const campaign = this.campaigns.find(c => c.id === campaignId);
    // if (campaign) {
    //   const newStatus = campaign.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    //   this.campaignService.updateStatus(campaignId, newStatus).subscribe();
    // }
  }

  /**
   * Delete campaign
   */
  onDelete(campaignId: number): void {
    console.log('[Resumen] Deleting campaign:', campaignId);
    if (confirm('¿Estás seguro de que deseas eliminar esta campaña?')) {
      // TODO: Implement campaign deletion
      // this.campaignService.delete(campaignId).subscribe();
    }
  }
}
