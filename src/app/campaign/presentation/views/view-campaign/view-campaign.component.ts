import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { CampaignService } from '../../services/campaign.service';
import { Campaign } from '../../../domain/model/campaign.entity';
import { CampaignOffer } from '../../../domain/model/offer.entity';

/**
 * ViewCampaignComponent
 *
 * Read-only view for campaign details.
 * Shows campaign information and associated offers.
 */
@Component({
  selector: 'app-view-campaign',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTabsModule
  ],
  templateUrl: './view-campaign.component.html',
  styleUrls: ['./view-campaign.component.css']
})
export class ViewCampaignComponent implements OnInit {
  private readonly campaignService = inject(CampaignService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  loading = false;
  campaignId: number = 0;
  campaign: Campaign | null = null;
  offers: CampaignOffer[] = [];

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

  getStatusColor(status: string): string {
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

  getStatusLabel(status: string): string {
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

  onEdit(): void {
    this.router.navigate(['/editar-campaña', this.campaignId]);
  }

  onBack(): void {
    this.router.navigate(['/resumen']);
  }
}
