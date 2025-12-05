import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Subject, takeUntil } from 'rxjs';
import { CampaignService } from '../../services/campaign.service';
import { Campaign } from '../../../domain/model/campaign.entity';
import { AuthService } from '../../../../identity/infrastructure/auth/auth.service';

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
    MatTabsModule
  ],
  templateUrl: './campaigns.component.html',
  styleUrls: ['./campaigns.component.css']
})
export class CampaignsComponent implements OnInit, OnDestroy {
  private readonly campaignService = inject(CampaignService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
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
    return this.campaigns.filter(c => c.status === 'INACTIVE');
  }

  get finishedCampaigns(): Campaign[] {
    return this.campaigns.filter(c => c.status === 'EXPIRED');
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
      case 'INACTIVE':
        return '#FFC107';
      case 'EXPIRED':
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
   * TODO: Implement edit route
   */
  onEdit(campaignId: number): void {
    // this.router.navigate(['/editar-campaña', campaignId]);
    console.log('Edit campaign:', campaignId);
    alert('La funcionalidad de edición está en desarrollo');
  }

  /**
   * Resume/Edit campaign (change status to ACTIVE)
   */
  onResumeEdit(campaignId: number): void {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (campaign) {
      this.campaignService.updateCampaign(campaignId, { status: 'ACTIVE' });
    }
  }

  /**
   * Delete campaign
   */
  onDelete(campaignId: number): void {
    if (confirm('¿Estás seguro de eliminar esta campaña?')) {
      this.campaignService.deleteCampaign(campaignId);
    }
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
