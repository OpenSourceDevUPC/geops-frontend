import { BaseEntity } from '../../../shared/infrastructure/base-entity';
import { Offer } from '../../../loyalty/domain/model/offer.entity';

export interface Coupon extends BaseEntity {
  userId: string;
  paymentId: string; // reference to payment that generated the coupon
  paymentCode: string; // code generated at payment time
  productType?: string; // copied from payment
  offerId?: number; // reference to the offer id
  offer?: Offer; // optional embedded offer data
  code: string; // the coupon code to redeem
  expiresAt?: string;
  createdAt: string;
}
