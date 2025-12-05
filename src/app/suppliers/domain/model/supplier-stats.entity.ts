import { BaseEntity } from '../../../shared/infrastructure/base-entity';

/**
 * Domain entity for supplier statistics
 * Contains key metrics and information for a supplier's dashboard
 */
export interface SupplierStats extends BaseEntity {
  supplierId: string;
  supplierName: string;
  activeCampaigns: number;
  totalViews: number;
  totalClicks: number;
  conversionRate: number;
  revenue: number;
  lastUpdated: string;
}

/**
 * Domain entity for a campaign
 * Represents a marketing campaign created by a supplier
 */
export interface Campaign extends BaseEntity {
  supplierId: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  views: number;
  clicks: number;
  conversions: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Domain entity for supplier profile
 */
export interface Supplier extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
  description: string;
  category: string;
  rating: number;
  isActive: boolean;
  joinedDate: string;
}

