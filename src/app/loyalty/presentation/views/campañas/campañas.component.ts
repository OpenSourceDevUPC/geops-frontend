import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

/**
 * CampañasComponent
 *
 * Vista de campañas para propietarios (OWNER).
 * Muestra campañas agrupadas por estado: Activas, Pausadas, Finalizadas
 */
@Component({
  selector: 'app-campañas',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule
  ],
  templateUrl: './campañas.component.html',
  styleUrls: ['./campañas.component.css']
})
export class CampañasComponent {
  /** Tab seleccionado actualmente */
  selectedTabIndex = 0;

  /** Campañas agrupadas por estado */
  campaigns = {
    activas: [
      {
        id: 1,
        title: 'ARUMA: Gift Card 5/ 40 por 5/ 28.90',
        status: 'Activa',
        startDate: '2025-01-20',
        endDate: '2025-02-28',
        impressions: 16400,
        clicks: 130,
        ctr: 7.8,
        audience: 'Audiencias Ciudadelas Obras, Tiendas ARUMA Lima'
      }
    ],
    pausadas: [
      {
        id: 2,
        title: 'Skincare Weekend -15%',
        status: 'Pausada',
        startDate: '2025-01-15',
        endDate: '2025-01-31',
        impressions: 80000,
        clicks: 430,
        ctr: 5.2,
        audience: 'Audiencias Ciudadelas, Limas, San Isidra, Miraflores'
      }
    ],
    finalizadas: [
      {
        id: 3,
        title: 'Back to School Fragancias -20%',
        status: 'Finalizada',
        startDate: '2025-01-10',
        endDate: '2025-02-28',
        impressions: 80000,
        clicks: 430,
        ctr: 5.2,
        audience: 'Audiencias Ciudadelas, Miraflores'
      }
    ]
  };

  /**
   * Obtiene el color del badge según el estado
   */
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'activa':
        return '#4CAF50';
      case 'pausada':
        return '#FFC107';
      case 'finalizada':
        return '#9E9E9E';
      default:
        return '#2196F3';
    }
  }

  /**
   * Obtiene las campañas del estado seleccionado
   */
  getSelectedCampaigns(): any[] {
    switch (this.selectedTabIndex) {
      case 0:
        return this.campaigns.activas;
      case 1:
        return this.campaigns.pausadas;
      case 2:
        return this.campaigns.finalizadas;
      default:
        return [];
    }
  }

  /**
   * Acciones de campaña
   */
  onResumeEdit(campaignId: number): void {
    console.log(`[Campañas] Editando/Reanudando campaña ${campaignId}`);
  }

  onEdit(campaignId: number): void {
    console.log(`[Campañas] Editando campaña ${campaignId}`);
  }

  onDelete(campaignId: number): void {
    console.log(`[Campañas] Eliminando campaña ${campaignId}`);
  }
}

