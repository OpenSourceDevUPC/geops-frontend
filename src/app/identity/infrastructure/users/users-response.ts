// src/app/identity/infrastructure/users/users-response.ts

/**
 * Business profile resource for users with OWNER role.
 */
export interface BusinessResource {
  businessName: string;
  businessType: string;
  taxId: string;
}

export type UserRole = 'OWNER' | 'CONSUMER';
export type PlanType = 'BASIC' | 'PREMIUM';

/**
 * User resource returned by API.
 */
export interface UserResource {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  plan: PlanType;
  phone?: string;
  business?: BusinessResource;
  favorites?: string[];
  home?: string;
  work?: string;
  university?: string;
  locationPermission?: string;
}

/**
 * API response for users.
 */
export interface UsersResponse {}
