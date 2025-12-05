import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PlansModalComponent } from '../../components/plans-modal/plans-modal.component';

@Component({
  selector: 'app-supplier-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, PlansModalComponent],
  templateUrl: './supplier-dashboard.component.html',
  styleUrls: ['./supplier-dashboard.component.css']
})
export class SupplierDashboardComponent {
  businessName = 'Aruma';
  activeCampaigns = '1';
  totalImpressions = '12,045';
  avgCTR = '6.5%';
  showPlansModal = false;

  openPlansModal() {
    this.showPlansModal = true;
  }

  closePlansModal() {
    this.showPlansModal = false;
  }

  recentCampaigns = [
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
    },
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
    },
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

