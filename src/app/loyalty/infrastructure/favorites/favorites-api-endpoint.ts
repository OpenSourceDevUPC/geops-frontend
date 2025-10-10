import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseApiEndpoint } from '../../../shared/infrastructure/base-api-endpoint';
import { FavoriteRow } from './favorites-assembler';
import { FavoriteRowResource, FavoriteRowsResponse } from './favorites-response';
import { FavoritesAssembler } from './favorites-assembler';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FavoritesApiEndpoint extends BaseApiEndpoint<
  FavoriteRow,
  FavoriteRowResource,
  FavoriteRowsResponse,
  FavoritesAssembler
> {
  /**
   * crea una instancia del servicio favoritesApiEndpoint
   * @param http - cliente http angular
   */
  constructor(http: HttpClient) {
    super(http, 'http://localhost:3000/favorites', new FavoritesAssembler());
  }

  /**
   * Obtiene las 'fila' favoritas del usuario
   * @param userId - id del usuario
   */
  getByUser(userId: number): Observable<FavoriteRow[]> {
    return this.http
      .get<FavoriteRowResource[]>(`${this.endpointUrl}?userId=${userId}`)
      .pipe(map(list => list.map(r => this.assembler.toEntityFromResource(r))));
  }

  /**
   * busca un favorito del usuario especifica
   * @param userId - id del usuario
   * @param offerId - id de la oferta
   */
  findRow(userId: number, offerId: number): Observable<FavoriteRow[]> {
    return this.http
      .get<FavoriteRowResource[]>(
        `${this.endpointUrl}?userId=${userId}&offerId=${offerId}`
      )
      .pipe(map(list => list.map(r => this.assembler.toEntityFromResource(r))));
  }

  /**
   * crea una nueva fila de favoritos
   * @param userId - id del usuario
   * @param offerId - id de la oferta
   */
  add(userId: number, offerId: number): Observable<FavoriteRow> {
    const body = { userId, offerId, createdAt: new Date().toISOString() };
    return this.http
      .post<FavoriteRowResource>(`${this.endpointUrl}`, body)
      .pipe(map(r => this.assembler.toEntityFromResource(r)));
  }

  /**
   * elimina el favorito
   * @param rowId - id en la fila de la seccion favoritos
   */
  removeRow(rowId: number): Observable<void> {
    return this.http.delete<void>(`${this.endpointUrl}/${rowId}`);
  }
}
