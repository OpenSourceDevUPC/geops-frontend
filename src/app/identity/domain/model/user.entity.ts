import { BaseEntity } from '../../../shared/infrastructure/base-entity';

/**
 * Defines possible user roles within the system.
 */
export type UserRole = 'OWNER' | 'CONSUMER' | 'ADMIN';

/**
 * Defines available subscription plans for users.
 */
export type PlanType = 'BASIC' | 'PREMIUM' | 'FREEMIUM';

/**
 * Consumer-specific details for users with CONSUMER role.
 * Maps to DetailsConsumer in backend.
 */
export interface DetailsConsumer {
  id?: number;
  categoriasFavoritas?: string;
  recibirNotificaciones?: boolean;
  permisoUbicacion?: boolean;
  direccionCasa?: string;
  direccionTrabajo?: string;
  direccionUniversidad?: string;
}

/**
 * Supplier-specific details for users with OWNER role.
 * Maps to DetailsSupplier in backend.
 */
export interface DetailsSupplier {
  id?: number;
  businessName?: string;
  businessType?: string;
  taxId?: string;
  website?: string;
  description?: string;
  address?: string;
  horarioAtencion?: string;
}

/**
 * Represents the business profile information for users with OWNER role.
 * @deprecated Use DetailsSupplier instead
 */
export interface BusinessProfile {
  businessName: string;
  businessType: string;
  taxId: string;
}

/**
 * Main user entity interface.
 * Extends BaseEntity and includes personal, business, and preference data.
 */
export interface User extends BaseEntity {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  plan: PlanType;
  phone?: string;

  // Legacy support
  business?: BusinessProfile;
  locationPermission?: string;
  favorites?: string[];
  home?: string;
  work?: string;
  university?: string;
  savedOffers?: number;

  // New backend integration
  detailsConsumer?: DetailsConsumer | null;
  detailsSupplier?: DetailsSupplier | null;
  createdAt?: Date;
  updatedAt?: Date;
}
