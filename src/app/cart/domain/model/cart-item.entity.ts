import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export interface CartItem extends BaseEntity {
  userId: string;
  offerId: string;
  offerTitle: string;
  offerPrice: number;
  offerImageUrl: string;
  quantity: number;
  total: number;
}
