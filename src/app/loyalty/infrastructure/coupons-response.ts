
import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface CouponResource extends BaseResource {
  userId: number;
  title: string;
  partner: string;
  code: string;
  validTo: string;
  status: string;
  source: string;
}

export interface CouponsResponse extends BaseResponse {
  content: CouponResource[]; // si tu backend devuelve wrapper; json-server devuelve array (lo maneja el base)
}
