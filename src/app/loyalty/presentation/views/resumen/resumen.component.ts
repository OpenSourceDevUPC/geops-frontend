import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';

/**
 * ResumenComponent
 *
 * Vista de resumen para propietarios (OWNER).
 * Muestra estadísticas principales del panel de control.
 */
@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule
  ],
  templateUrl: './resumen.component.html',
  styleUrls: ['./resumen.component.css']
})
export class ResumenComponent {
  /** Nombre del propietario */
  ownerName = 'Aruma';

  /** Plan del propietario */
  plan = 'Premium';

  /** Estadísticas principales */
  stats = {
    activeCampaigns: 1,
    totalImpressions: 12045,
    ctr: 6.5
  };

  /** Campañas activas */
  campaigns = [
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
    },
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
    },
    {
      id: 3,
      title: 'Back to School Fragancias -20%',
      status: 'Pausada',
      startDate: '2025-01-10',
      endDate: '2025-02-28',
      impressions: 80000,
      clicks: 430,
      ctr: 5.2,
      audience: 'Audiencias Ciudadelas, Miraflores'
    }
  ];

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
   * Acciones de campaña
   */
  onEdit(campaignId: number): void {
    console.log(`[Resumen] Editando campaña ${campaignId}`);
  }

  onPause(campaignId: number): void {
    console.log(`[Resumen] Pausando campaña ${campaignId}`);
  }

  onDelete(campaignId: number): void {
    console.log(`[Resumen] Eliminando campaña ${campaignId}`);
  }

  onView(campaignId: number): void {
    console.log(`[Resumen] Viendo campaña ${campaignId}`);
  }
}

