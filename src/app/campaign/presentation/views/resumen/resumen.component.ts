import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CampaignService } from '../../services/campaign.service';
import { Campaign } from '../../../domain/model/campaign.entity';

/**
 * ResumenComponent
 * 
 * Dashboard summary view showing campaign overview and statistics.
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
  
  campaigns: Campaign[] = [];
  totalImpressions = 0;
  totalClicks = 0;
  averageCTR = 0;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.campaignService.campaigns$.subscribe(campaigns => {
      this.campaigns = campaigns;
      this.calculateMetrics();
    });
  }

  private calculateMetrics(): void {
    this.totalImpressions = this.campaigns.reduce((sum, c) => sum + c.totalImpressions, 0);
    this.totalClicks = this.campaigns.reduce((sum, c) => sum + c.totalClicks, 0);
    this.averageCTR = this.campaigns.length > 0 
      ? this.campaigns.reduce((sum, c) => sum + c.ctr, 0) / this.campaigns.length 
      : 0;
  }
}
