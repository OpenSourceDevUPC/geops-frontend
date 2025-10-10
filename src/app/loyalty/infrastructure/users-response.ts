// src/app/identity/infrastructure/users/users-response.ts
export interface BusinessResource {
  businessName: string;
  businessType: string;
  taxId: string;
}

export type UserRole = 'OWNER' | 'CONSUMER';
export type PlanType = 'BASIC' | 'PREMIUM';

export interface UserResource {
  id: number;
  name: string;
  email: string;
  password: string;           // requerido para register/login
  role: UserRole;
  plan: PlanType;
  phone?: string;
  business?: BusinessResource; // solo si role === 'OWNER'
}

export interface UsersResponse {}
