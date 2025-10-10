// src/app/identity/domain/model/user.entity.ts
import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export type UserRole = 'OWNER' | 'CONSUMER';
export type PlanType = 'BASIC' | 'PREMIUM';

export interface BusinessProfile {
  businessName: string;
  businessType: string;
  taxId: string;
}

export interface User extends BaseEntity {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  plan: PlanType;
  phone?: string;
  business?: BusinessProfile;
}
