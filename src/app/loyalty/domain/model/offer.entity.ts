import { BaseEntity } from '../../../shared/infrastructure/base-entity';

/**
 * entidad de dominio para una oferta
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
