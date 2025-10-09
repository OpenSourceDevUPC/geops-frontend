
export interface OfferResource {
  /**
   * tipos de datos para la api de ofertas
   */
  id: number;
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

export interface OffersResponse {}
