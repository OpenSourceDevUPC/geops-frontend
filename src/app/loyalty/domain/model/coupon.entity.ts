
import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export interface Coupon extends BaseEntity {
  userId: number;
  title: string;
  partner: string;
  code: string;
  validTo: string; // ISO 8601
  status: 'active'|'used'|'expired';
  source: 'purchase'|'loyalty'|'referral';
}
