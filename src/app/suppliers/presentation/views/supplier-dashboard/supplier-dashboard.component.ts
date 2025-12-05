import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { SuppliersService } from '../../../infrastructure/suppliers.service';
import { SupplierStats, Campaign, Supplier } from '../../../domain/model/supplier-stats.entity';
@Component({
  selector: 'app-supplier-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTableModule],
  templateUrl: './supplier-dashboard.component.html',
  styleUrls: ['./supplier-dashboard.component.css']
})
export class SupplierDashboardComponent implements OnInit {
  private readonly suppliersService = inject(SuppliersService);
  private readonly router = inject(Router);
  stats = signal<SupplierStats | null>(null);
  recentCampaigns = signal<Campaign[]>([]);
  supplier = signal<Supplier | null>(null);
  isLoading = signal(true);
  displayedColumns: string[] = ['name', 'status', 'views', 'clicks', 'conversions', 'budget', 'actions'];
  ngOnInit() {
    this.loadDashboardData();
  }
  private loadDashboardData() {
    this.isLoading.set(true);
    const supplierId = 'supplier-123';
    this.suppliersService.getCurrentSupplier().subscribe({
      next: (supplier) => {
        this.supplier.set(supplier);
      }
    });
    this.suppliersService.getSupplierStats(supplierId).subscribe({
      next: (stats) => {
        this.stats.set(stats);
      }
    });
    this.suppliersService.getRecentCampaigns(supplierId, 5).subscribe({
      next: (campaigns) => {
        this.recentCampaigns.set(campaigns);
        this.isLoading.set(false);
      }
    });
  }
  onCreateCampaign() {
    this.router.navigate(['/suppliers/campaigns/new']);
  }
  onViewCampaign(campaign: Campaign) {
    this.router.navigate(['/suppliers/campaigns', campaign.id]);
  }
  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'active': 'status-active',
      'paused': 'status-paused',
      'completed': 'status-completed',
      'draft': 'status-draft'
    };
    return statusClasses[status] || '';
  }
  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'active': 'Activa',
      'paused': 'Pausada',
      'completed': 'Completada',
      'draft': 'Borrador'
    };
    return statusLabels[status] || status;
  }
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }
  formatNumber(num: number): string {
    return new Intl.NumberFormat('es-ES').format(num);
  }
  formatPercentage(num: number): string {
    return `${num.toFixed(1)}%`;
  }
}
