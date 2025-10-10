import { BaseResponse, BaseResource } from '../../shared/infrastructure/base-response';
import { OfferResource } from '../../loyalty/infrastructure/offers-response';

export interface CouponResource extends BaseResource {
  userId: string;
  paymentId: string;
  paymentCode: string;
  productType?: string;
  offerId?: number | string;
  offer?: OfferResource; // optional embedded offer
  code: string;
  expiresAt?: string;
  createdAt: string;
}

export interface CouponsResponse extends BaseResponse {
  data: CouponResource[];
}
