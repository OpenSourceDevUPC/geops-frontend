import { BaseResponse, BaseResource } from '../../shared/infrastructure/base-response';

export interface CartItemResource extends BaseResource {
  userId: string;
  offerId: string;
  offerTitle: string;
  offerPrice: number;
  offerImageUrl: string;
  quantity: number;
  total: number;
}

export interface CartResource extends BaseResource {
  userId: string;
  items: CartItemResource[];
  totalItems: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartResponse extends BaseResponse {
  data: CartResource[];
}
