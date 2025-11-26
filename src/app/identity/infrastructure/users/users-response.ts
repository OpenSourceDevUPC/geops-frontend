// src/app/identity/infrastructure/users/users-response.ts

/**
 * Consumer details resource from API.
 */
export interface DetailsConsumerResource {
  id?: number;
  categoriasFavoritas?: string;
  recibirNotificaciones?: boolean;
  permisoUbicacion?: boolean;
  direccionCasa?: string;
  direccionTrabajo?: string;
  direccionUniversidad?: string;
}

/**
 * Supplier details resource from API.
 */
export interface DetailsSupplierResource {
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
 * Business profile resource for users with OWNER role.
 * @deprecated Use DetailsSupplierResource instead
 */
export interface BusinessResource {
  businessName: string;
  businessType: string;
  taxId: string;
}

export type UserRole = 'OWNER' | 'CONSUMER' | 'ADMIN';
export type PlanType = 'BASIC' | 'PREMIUM' | 'FREEMIUM';

/**
 * User resource returned by API.
 */
export interface UserResource {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  plan: PlanType;
  phone?: string;

  // Legacy fields
  business?: BusinessResource;
  favorites?: string[];
  home?: string;
  work?: string;
  university?: string;
  locationPermission?: string;

  // New backend fields
  detailsConsumer?: DetailsConsumerResource | null;
  detailsSupplier?: DetailsSupplierResource | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/**
 * API response for users.
 */
export interface UsersResponse {}
