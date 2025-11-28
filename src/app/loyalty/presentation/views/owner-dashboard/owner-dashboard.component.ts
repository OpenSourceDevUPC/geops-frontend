import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../../identity/infrastructure/auth/auth.service';
import { User } from '../../../../identity/domain/model/user.entity';
import { DetailsOwner } from '../../../../identity/domain/model/details-owner.entity';
import { DetailsOwnerService } from '../../../../identity/infrastructure/users/details-owner.service';

interface Campaign {
  id: number;
  title: string;
  status: 'active' | 'paused' | 'inactive';
  audience: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

/**
 * OwnerDashboardComponent
 *
 * Dashboard principal para usuarios con rol OWNER.
 * Muestra estadísticas de campañas, métricas y permite gestionar ofertas.
 */
@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './owner-dashboard.component.html',
  styleUrls: ['./owner-dashboard.component.css']
})
export class OwnerDashboardComponent implements OnInit {
  user: User | null = null;
  ownerDetails: DetailsOwner | null = null;

  // Estadísticas generales
  activeCampaigns = 1;
  totalImpressions = 12045;
  avgCTR = 6.5;

  // Campañas del usuario
  campaigns: Campaign[] = [
    {
      id: 1,
      title: 'ARUMA: Gift Card S/ 40 por S/ 28.90',
      status: 'active',
      audience: 'Ciudades: Gubiado, Callao, Lima, Otros, Tiendas Aruma, Lima',
      impressions: 10435,
      clicks: 1210,
      ctr: 7.8
    },
    {
      id: 2,
      title: 'Skincare Weekend -15%',
      status: 'paused',
      audience: 'Ciudades: Lima, San Isidro, Miraflores',
      impressions: 10200,
      clicks: 420,
      ctr: 5.2
    },
    {
      id: 3,
      title: 'Back to School Fragancias -20%',
      status: 'inactive',
      audience: 'Ciudades: Miraflores',
      impressions: 10200,
      clicks: 420,
      ctr: 5.2
    }
  ];

  constructor(
    private authService: AuthService,
    private detailsOwnerService: DetailsOwnerService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (this.user?.id) {
      this.loadOwnerDetails();
    }
  }

  /**
   * Carga los detalles del negocio del owner
   */
  private loadOwnerDetails(): void {
    if (!this.user) return;

    this.detailsOwnerService.getByUserId(this.user.id).subscribe({
      next: (details) => {
        this.ownerDetails = details;
        console.log('[OwnerDashboard] Owner details loaded:', details);
      },
      error: (error) => {
        console.error('[OwnerDashboard] Error loading owner details:', error);
      }
    });
  }

  /**
   * Obtiene el nombre a mostrar (nombre del negocio o nombre del usuario)
   */
  get displayName(): string {
    return this.ownerDetails?.businessName || this.user?.name || 'Usuario';
  }

  /**
   * Pausa una campaña
   */
  pauseCampaign(campaign: Campaign): void {
    console.log('[OwnerDashboard] Pausing campaign:', campaign.id);
    campaign.status = 'paused';
  }

  /**
   * Edita una campaña
   */
  editCampaign(campaign: Campaign): void {
    console.log('[OwnerDashboard] Editing campaign:', campaign.id);
    // TODO: Navegar a formulario de edición
  }

  /**
   * Elimina una campaña
   */
  deleteCampaign(campaign: Campaign): void {
    console.log('[OwnerDashboard] Deleting campaign:', campaign.id);
    const index = this.campaigns.findIndex(c => c.id === campaign.id);
    if (index > -1) {
      this.campaigns.splice(index, 1);
      this.activeCampaigns = this.campaigns.filter(c => c.status === 'active').length;
    }
  }

  /**
   * Obtiene la clase CSS según el estado de la campaña
   */
  getStatusClass(status: string): string {
    switch(status) {
      case 'active': return 'status-active';
      case 'paused': return 'status-paused';
      case 'inactive': return 'status-inactive';
      default: return '';
    }
  }

  /**
   * Obtiene el texto traducido del estado
   */
  getStatusText(status: string): string {
    switch(status) {
      case 'active': return 'Activo';
      case 'paused': return 'Pausado';
      case 'inactive': return 'Inactivo';
      default: return status;
    }
  }
}

