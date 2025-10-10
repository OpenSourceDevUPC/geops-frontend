import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
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
   * creates an instance of the favoritesApiEndpoint service
   * @param http - angular http client
   */
  constructor(http: HttpClient) {
    super(http, 'http://localhost:3000/favorites', new FavoritesAssembler());
  }

  /**
   * gets the user's favorite rows
   * @param userId - user id
   */
  getByUser(userId: number): Observable<FavoriteRow[]> {
    return this.http
      .get<FavoriteRowResource[]>(`${this.endpointUrl}?userId=${userId}`)
      .pipe(map(list => list.map(r => this.assembler.toEntityFromResource(r))));
  }

  /**
   * search for a specific user favorite
   * @param userId - user id
   * @param offerId - offer id
   */
  findRow(userId: number, offerId: number): Observable<FavoriteRow[]> {
    return this.http
      .get<FavoriteRowResource[]>(
        `${this.endpointUrl}?userId=${userId}&offerId=${offerId}`
      )
      .pipe(map(list => list.map(r => this.assembler.toEntityFromResource(r))));
  }

  /**
   * create a new favorites row
   * @param userId
   * @param offerId
   */
  add(userId: number, offerId: number): Observable<FavoriteRow> {
    const body = { userId, offerId, createdAt: new Date().toISOString() };
    return this.http
      .post<FavoriteRowResource>(`${this.endpointUrl}`, body)
      .pipe(map(r => this.assembler.toEntityFromResource(r)));
  }

  /**
   * delete the favorite
   * @param rowId - go to the favorites section row
   */
  removeRow(rowId: number): Observable<void> {
    return this.http.delete<void>(`${this.endpointUrl}/${rowId}`);
  }
}
