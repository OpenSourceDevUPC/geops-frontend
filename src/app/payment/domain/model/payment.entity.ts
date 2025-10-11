import { BaseEntity } from '../../../shared/infrastructure/base-entity';
import { PaymentMethod, PaymentStatus } from './payment-method.enum';

export interface Payment extends BaseEntity {
  userId: string;
  cartId: string;
  amount: number;
  // productType indicates which domain/table the payment refers to (e.g., 'offer', 'subscription')
  productType?: string;
  // productId is the id of the purchased product in its respective table
  productId?: string;
  // paymentCodes holds generated codes per purchased item (one per coupon)
  paymentCodes?: { offerId: string; code: string }[];
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  paymentCode?: string; // For Yape or card transaction reference
  createdAt: string;
  completedAt?: string;
}
