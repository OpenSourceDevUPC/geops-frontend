import { BaseEntity } from '../../../shared/infrastructure/base-entity';
import { CartItem } from './cart-item.entity';

export interface Cart extends BaseEntity {
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}
