import { BaseEntity } from '../../../shared/infrastructure/base-entity';
import { PaymentMethod, PaymentStatus } from './payment-method.enum';

export interface Payment extends BaseEntity {
  userId: string;
  cartId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  paymentCode?: string; // For Yape or card transaction reference
  createdAt: string;
  completedAt?: string;
}
