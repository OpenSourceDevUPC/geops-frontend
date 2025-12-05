import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { SupplierStats, Campaign, Supplier } from '../domain/model/supplier-stats.entity';

@Injectable({
  providedIn: 'root'
})
export class SuppliersService {
  private currentSupplier$ = new BehaviorSubject<Supplier | null>(null);

  constructor() {
    this.currentSupplier$.next(this.getMockSupplier());
  }

  getCurrentSupplier(): Observable<Supplier | null> {
    return this.currentSupplier$.asObservable();
  }

  getSupplierStats(supplierId: string): Observable<SupplierStats> {
    return of({
      id: 1,
      supplierId,
      supplierName: 'Mi Negocio Demo',
      activeCampaigns: 12,
      totalViews: 45678,
      totalClicks: 3456,
      conversionRate: 7.5,
      revenue: 125000,
      lastUpdated: new Date().toISOString()
    });
  }

  getRecentCampaigns(supplierId: string, limit: number = 5): Observable<Campaign[]> {
    const campaigns: Campaign[] = [
      {
        id: 1,
        supplierId,
        name: 'Promoción Verano 2024',
        description: 'Descuentos especiales de verano',
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        budget: 15000,
        spent: 8500,
        views: 12500,
        clicks: 850,
        conversions: 125,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-12-04T10:00:00Z'
      },
      {
        id: 2,
        supplierId,
        name: 'Black Friday Especial',
        description: 'Mega ofertas de Black Friday',
        status: 'active',
        startDate: '2024-11-20',
        endDate: '2024-11-30',
        budget: 25000,
        spent: 22000,
        views: 35000,
        clicks: 2800,
        conversions: 320,
        createdAt: '2024-11-15T10:00:00Z',
        updatedAt: '2024-12-04T10:00:00Z'
      },
      {
        id: 3,
        supplierId,
        name: 'Navidad 2024',
        description: 'Ofertas navideñas para toda la familia',
        status: 'paused',
        startDate: '2024-12-01',
        endDate: '2024-12-25',
        budget: 30000,
        spent: 5000,
        views: 8500,
        clicks: 420,
        conversions: 45,
        createdAt: '2024-11-25T10:00:00Z',
        updatedAt: '2024-12-04T10:00:00Z'
      },
      {
        id: 4,
        supplierId,
        name: 'Año Nuevo 2025',
        description: 'Comienza el año con grandes ofertas',
        status: 'draft',
        startDate: '2024-12-26',
        endDate: '2025-01-10',
        budget: 20000,
        spent: 0,
        views: 0,
        clicks: 0,
        conversions: 0,
        createdAt: '2024-12-01T10:00:00Z',
        updatedAt: '2024-12-04T10:00:00Z'
      },
      {
        id: 5,
        supplierId,
        name: 'San Valentín 2025',
        description: 'Promociones especiales para San Valentín',
        status: 'draft',
        startDate: '2025-02-01',
        endDate: '2025-02-14',
        budget: 18000,
        spent: 0,
        views: 0,
        clicks: 0,
        conversions: 0,
        createdAt: '2024-12-02T10:00:00Z',
        updatedAt: '2024-12-04T10:00:00Z'
      }
    ];

    return of(campaigns.slice(0, limit));
  }

  getAllCampaigns(supplierId: string): Observable<Campaign[]> {
    return this.getRecentCampaigns(supplierId, 100);
  }

  private getMockSupplier(): Supplier {
    return {
      id: 1,
      name: 'Restaurante El Buen Sabor',
      email: 'contacto@elbuensabor.com',
      phone: '+34 123 456 789',
      address: 'Calle Principal 123, Madrid',
      description: 'El mejor restaurante de comida tradicional de Madrid',
      category: 'Restaurante',
      rating: 4.8,
      isActive: true,
      joinedDate: '2023-01-15'
    };
  }
}

