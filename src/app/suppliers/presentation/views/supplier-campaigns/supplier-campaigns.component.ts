import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface Campaign {
  id: number;
  title: string;
  status: string;
  statusLabel: string;
  impressions: string;
  clicks: string;
  ctr: string;
  dates: string;
  budget: string;
  audience: string;
}

@Component({
  selector: 'app-supplier-campaigns',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './supplier-campaigns.component.html',
  styleUrls: ['./supplier-campaigns.component.css']
})
export class SupplierCampaignsComponent {
  businessName = 'Aruma';

  activeCampaigns: Campaign[] = [
    {
      id: 1,
      title: 'ARUMA: Gift Card S/ 40 por S/ 29.90',
      status: 'activa',
      statusLabel: 'Activa',
      impressions: '15420',
      clicks: '1210',
      ctr: '7.8%',
      dates: '2025-09-20 → 2025-16-31',
      budget: 'Presupuesto: S/ 6000',
      audience: 'Audiencia: Ciudades: Online, Tiendas Aruma, Lima'
    }
  ];

  pausedCampaigns: Campaign[] = [
    {
      id: 2,
      title: 'Skincare Weekend -15%',
      status: 'pausada',
      statusLabel: 'Pausada',
      impressions: '80200',
      clicks: '430',
      ctr: '5.2%',
      dates: '2025-09-10 → 2025-09-30',
      budget: 'Presupuesto: S/ 4500',
      audience: 'Audiencia: Ciudades: Lima, San Isidro, Miraflores'
    }
  ];

  finishedCampaigns: Campaign[] = [
    {
      id: 3,
      title: 'Back to School Fragancias -20%',
      status: 'finalizada',
      statusLabel: 'Finalizada',
      impressions: '80200',
      clicks: '430',
      ctr: '5.2%',
      dates: '2025-08-01 → 2025-08-30',
      budget: 'Presupuesto: S/ 3000',
      audience: 'Audiencia: Ciudades: Miraflores'
    }
  ];
}

