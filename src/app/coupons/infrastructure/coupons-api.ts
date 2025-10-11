import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap, catchError, from, mergeMap, toArray, of, lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { Coupon } from '../domain/model/coupon.entity';
import { CouponsApiEndpoint } from './coupons-api-endpoint';
import { environment } from '../../../environments/environment';
import { CouponsAssembler } from './coupons-assembler';
import { CouponResource, CouponsResponse } from './coupons-response';

@Injectable({ providedIn: 'root' })
export class CouponsApi extends BaseApi {
  private readonly endpoint: CouponsApiEndpoint;
  private couponsSubject = new BehaviorSubject<Coupon[]>([]);
  public coupons$ = this.couponsSubject.asObservable();

  constructor(private http: HttpClient) {
    super();
    this.endpoint = new CouponsApiEndpoint(http);
  }

  /**
   * Create multiple coupons in a single request.
   * Expects the backend to expose a bulk endpoint at /coupons/bulk that accepts an array of coupon resources.
   */
  createMany(coupons: Array<Omit<Coupon, 'id'>>): Observable<Coupon[]> {
    const url = `${environment.platformProviderApiBaseUrl}/coupons/bulk`;
    const assembler = new CouponsAssembler();
     const asyncOp = async (): Promise<Coupon[]> => {
       try {
         const response = await lastValueFrom(this.http.post<CouponResource[] | CouponsResponse>(url, coupons));
         const created = Array.isArray(response)
           ? response.map(r => assembler.toEntityFromResource(r as CouponResource))
           : assembler.toEntitiesFromResponse(response as CouponsResponse);

         this.couponsSubject.next([...this.couponsSubject.value, ...created]);
         return created;
       } catch (err) {
         const createdSequential: Coupon[] = [];
         for (const c of coupons) {
           try {
             const createdCoupon = await lastValueFrom(this.createCoupon(c));
             createdSequential.push(createdCoupon);
           } catch (e) {
             // console.warn('Failed to create coupon', e);
           }
         }

         if (createdSequential.length > 0) {
           this.couponsSubject.next([...this.couponsSubject.value, ...createdSequential]);
         }
         return createdSequential;
       }
     };

     return from(asyncOp());
  }

  getAllCoupons(): Observable<Coupon[]> {
    return this.endpoint.getAll().pipe(
      tap((coupons: Coupon[]) => this.couponsSubject.next(coupons))
    );
  }

  getCouponsByUser(userId: string): Observable<Coupon[]> {
    return this.endpoint.getAll().pipe(
      map((coupons: Coupon[]) => coupons.filter(c => c.userId === userId)),
      tap(filtered => this.couponsSubject.next(filtered))
    );
  }

  createCoupon(coupon: Omit<Coupon, 'id'>): Observable<Coupon> {
    return this.endpoint.create(coupon as Coupon).pipe(
      tap(c => this.couponsSubject.next([...this.couponsSubject.value, c]))
    );
  }

  /**
   * Fetch coupons including related resources using JSON Server's _expand and _embed
   * @param expand list of single relationships to expand (e.g. ['offer','user'])
   * @param embed list of array relationships to embed (e.g. ['comments'])
   */
  getAllWithRelations(expand: string[] = [], embed: string[] = []): Observable<Coupon[]> {
    const params = new URLSearchParams();
    expand.forEach(e => params.append('_expand', e));
    embed.forEach(e => params.append('_embed', e));

    const url = `${environment.platformProviderApiBaseUrl}/coupons${params.toString() ? ('?' + params.toString()) : ''}`;
    const assembler = new CouponsAssembler();

    return this.http.get<CouponResource[] | CouponsResponse>(url).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response.map(r => assembler.toEntityFromResource(r as CouponResource));
        }
        return assembler.toEntitiesFromResponse(response as CouponsResponse);
      }),
      tap((coupons: Coupon[]) => this.couponsSubject.next(coupons))
    );
  }

  /**
   * Fetch coupons for a specific user including related resources using JSON Server's _expand and _embed
   * @param userId user id to filter coupons
   * @param expand list of single relationships to expand (e.g. ['offer','user'])
   * @param embed list of array relationships to embed (e.g. ['comments'])
   */
  getAllWithRelationsByUser(userId: string, expand: string[] = [], embed: string[] = []): Observable<Coupon[]> {
    const params = new URLSearchParams();
    params.append('userId', userId);
    expand.forEach(e => params.append('_expand', e));
    embed.forEach(e => params.append('_embed', e));

    const url = `${environment.platformProviderApiBaseUrl}/coupons${params.toString() ? ('?' + params.toString()) : ''}`;
    const assembler = new CouponsAssembler();

    return this.http.get<CouponResource[] | CouponsResponse>(url).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response.map(r => assembler.toEntityFromResource(r as CouponResource));
        }
        return assembler.toEntitiesFromResponse(response as CouponsResponse);
      }),
      tap((coupons: Coupon[]) => this.couponsSubject.next(coupons))
    );
  }
}
