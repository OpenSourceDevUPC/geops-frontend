import { BaseEntity } from '../../../shared/infrastructure/base-entity';

/**
 * Defines possible user roles within the system.
 */
export type UserRole = 'OWNER' | 'CONSUMER';

/**
 * Defines available subscription plans for users.
 */
export type PlanType = 'BASIC' | 'PREMIUM';

/**
 * Represents the business profile information for users with OWNER role.
 */
export interface BusinessProfile {
  businessName: string;
  businessType: string;
  taxId: number;
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
  business?: BusinessProfile;
  locationPermission?: string;
  favorites?: string[];
  home?: string;
  work?: string;
  university?: string;
  savedOffers?: number;
}
