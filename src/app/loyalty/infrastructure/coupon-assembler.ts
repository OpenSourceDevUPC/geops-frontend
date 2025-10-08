/**
 * Assembler estructura igual que el profe.
 */
import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Coupon } from '../domain/model/coupon.entity';
import { CouponResource, CouponsResponse } from './coupons-response';

export class CouponAssembler implements BaseAssembler<Coupon, CouponResource, CouponsResponse> {
  toEntityFromResource(r: CouponResource): Coupon {
    return {
      id: r.id,
      userId: r.userId,
      title: r.title,
      partner: r.partner,
      code: r.code,
      validTo: r.validTo,
      status: r.status as Coupon['status'],
      source: r.source as Coupon['source']
    };
  }

  toResourceFromEntity(e: Coupon): CouponResource { return { ...e }; }

  toEntitiesFromResponse(resp: CouponsResponse): Coupon[] {
    return resp.content.map((r) => this.toEntityFromResource(r));
  }
}
