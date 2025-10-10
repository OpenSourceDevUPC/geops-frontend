import { BaseResponse, BaseResource } from '../../shared/infrastructure/base-response';
import { PaymentMethod, PaymentStatus } from '../domain/model/payment-method.enum';

export interface PaymentResource extends BaseResource {
  userId: string;
  cartId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  paymentCode?: string;
  createdAt: string;
  completedAt?: string;
}

export interface PaymentResponse extends BaseResponse {
  data: PaymentResource[];
}
