/**
 * Estructura del profe
 */
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Coupon } from '../domain/model/coupon.entity';
import { CouponResource, CouponsResponse } from './coupons-response';
import { CouponAssembler } from './coupon-assembler';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {map, Observable} from 'rxjs';

export class CouponsApiEndpoint extends
  BaseApiEndpoint<Coupon, CouponResource, CouponsResponse, CouponAssembler> {

  constructor(http: HttpClient) {
    super(
      http,
      `${environment.platformProviderApiBaseUrl}/coupons`,
      new CouponAssembler()
    );
  }

  /**
   * Lista d cupones del usuario
   * @param userId
   */
  getByUser(userId: number): Observable<Coupon[]> {
    const url = `${this.endpointUrl}?userId=${userId}`;
    return this.http.get<CouponResource[]>(url).pipe(
      map(resources => resources.map(r => this.assembler.toEntityFromResource(r)))
    );
  }
}
