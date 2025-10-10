import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Offer } from '../domain/model/offer.entity';
import { OfferResource, OffersResponse } from './offers-response';

export class OffersAssembler
  implements BaseAssembler<Offer, OfferResource, OffersResponse>
{
  /**
   * convierte un recurso recibido de la api a una entidad de dominio
   * @param r - recurso recibido de la api
   */
  toEntityFromResource(r: OfferResource): Offer {
    return { ...r };
  }

  /**
   * convierte una entidad de dominio al formato de recurso esperado por la api
   * @param e - entidad de dominio
   */
  toResourceFromEntity(e: Offer): OfferResource {
    return { ...e };
  }

  /**
   * convierte una respuesta "envoltorio" de la API a un arreglo de entidades
   * @param _resp - respuesta de la api
   */
  toEntitiesFromResponse(_resp: OffersResponse): Offer[] {
    return [];
  }
}
