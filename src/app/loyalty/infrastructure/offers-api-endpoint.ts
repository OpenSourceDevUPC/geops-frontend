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
   * creates an instance of the offersApiEndpoint service
   * @param http - angular http client
   */
  constructor(http: HttpClient) {
    super(http, 'http://localhost:3000/offers', new OffersAssembler());
  }

  /**
   * gets a set of offers for its ids
   * @param ids - list of ids
   */
  getByIds(ids: number[]): Observable<Offer[]> {
    const qs = ids.map(id => `id=${encodeURIComponent(String(id))}`).join('&');
    return this.http
      .get<OfferResource[]>(`${this.endpointUrl}?${qs}`)
      .pipe(map(list => list.map(r => this.assembler.toEntityFromResource(r))));
  }
}
