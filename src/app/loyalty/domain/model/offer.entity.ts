import { BaseEntity } from '../../../shared/infrastructure/base-entity';

/**
 * domain entity for an offer
 */
export interface Offer extends BaseEntity {
  title: string;
  partner: string;
  price: number;
  codePrefix: string;
  validTo: string;
  rating: number;
  location: string;
  category: string;
  imageUrl?: string;
}
