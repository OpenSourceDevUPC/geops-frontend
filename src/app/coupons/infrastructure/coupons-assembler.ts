import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Coupon } from '../domain/model/coupon.entity';
import { CouponResource, CouponsResponse } from './coupons-response';
import { Offer } from '../../loyalty/domain/model/offer.entity';

function mapOfferResourceToEntity(r?: any): Offer | undefined {
  if (!r) return undefined;
  return {
    id: r.id,
    title: r.title,
    partner: r.partner,
    price: r.price,
    codePrefix: r.codePrefix,
    validTo: r.validTo,
    rating: r.rating,
    location: r.location,
    category: r.category,
    imageUrl: r.imageUrl
  } as Offer;
}

export class CouponsAssembler implements BaseAssembler<Coupon, CouponResource, CouponsResponse> {
  toEntityFromResource(resource: CouponResource): Coupon {
    return {
      id: resource.id,
      userId: resource.userId,
      paymentId: resource.paymentId,
      paymentCode: resource.paymentCode,
      productType: resource.productType,
      offerId: typeof resource.offerId === 'string' ? Number(resource.offerId) : resource.offerId,
      offer: mapOfferResourceToEntity(resource.offer),
      code: resource.code,
      expiresAt: resource.expiresAt,
      createdAt: resource.createdAt
    };
  }

  toResourceFromEntity(entity: Coupon): CouponResource {
    return {
      id: entity.id,
      userId: entity.userId,
      paymentId: entity.paymentId,
      paymentCode: entity.paymentCode,
      productType: entity.productType,
      offerId: entity.offerId,
      offer: entity.offer as any,
      code: entity.code,
      expiresAt: entity.expiresAt,
      createdAt: entity.createdAt
    };
  }

  toEntitiesFromResponse(response: CouponsResponse): Coupon[] {
    return response.data.map(r => this.toEntityFromResource(r));
  }
}
