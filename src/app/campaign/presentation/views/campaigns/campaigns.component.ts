import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
    MatTabsModule,
    MatSnackBarModule
  ],
  templateUrl: './campaigns.component.html',
  styleUrls: ['./campaigns.component.css']
})
export class CampaignsComponent implements OnInit, OnDestroy {
  private readonly campaignService = inject(CampaignService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
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
   * Resume/Edit campaign (change status to ACTIVE)
   */
  onResumeEdit(campaignId: number): void {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (campaign) {
      this.campaignService.updateCampaign(campaignId, { status: 'ACTIVE' });
    }
  }

  /**
   * Delete campaign with confirmation
   */
  onDelete(campaignId: number): void {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    const campaignName = campaign ? campaign.name : 'esta campaña';

    if (confirm(`¿Estás seguro de eliminar "${campaignName}"? Esta acción no se puede deshacer.`)) {
      this.campaignService.deleteCampaign(campaignId);
      this.snackBar.open('Campaña eliminada exitosamente', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
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
