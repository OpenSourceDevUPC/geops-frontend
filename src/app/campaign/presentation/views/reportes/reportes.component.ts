import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { CampaignService } from '../../services/campaign.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent {
  private readonly campaignService = inject(CampaignService);

  get jsonData(): string {
    return JSON.stringify(this.campaignService.getCurrentCampaigns(), null, 2);
  }

  exportReport(): void {
    const blob = new Blob([this.jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-report-${new Date().getTime()}.json`;
    a.click();
  }
}
