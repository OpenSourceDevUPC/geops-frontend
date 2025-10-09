import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Offer } from '../domain/model/offer.entity';
import { OfferResource, OffersResponse } from './offers-response';
import { OffersAssembler } from './offers-assembler';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OffersApiEndpoint extends BaseApiEndpoint<
  Offer,
  OfferResource,
  OffersResponse,
  OffersAssembler
> {
  /**
   * crea una instancia del servicio offersApiEndpoint
   * @param http - cliente http angular
   */
  constructor(http: HttpClient) {
    super(http, 'http://localhost:3001/offers', new OffersAssembler());
  }

  /**
   * obtiene un conjunto de ofertas por sus ids
   * @param ids - lista de ids
   */
  getByIds(ids: number[]): Observable<Offer[]> {
    const qs = ids.map(id => `id=${encodeURIComponent(String(id))}`).join('&');
    return this.http
      .get<OfferResource[]>(`${this.endpointUrl}?${qs}`)
      .pipe(map(list => list.map(r => this.assembler.toEntityFromResource(r))));
  }
}
