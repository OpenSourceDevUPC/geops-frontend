import { BaseEntity } from '../../../shared/infrastructure/base-entity';

/**
 * Domain entity for a subscription plan
 */
export interface Subscription extends BaseEntity {
  price: number;
  recommended: boolean;
  type: 'basic' | 'premium';
}
