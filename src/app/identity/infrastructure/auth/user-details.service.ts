import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { DetailsConsumer, DetailsSupplier } from '../../domain/model/user.entity';
import { DetailsConsumerApiEndpoint } from '../users/details-consumer-api-endpoint';
import { DetailsSupplierApiEndpoint } from '../users/details-supplier-api-endpoint';
import { AuthService } from './auth.service';

/**
 * Service to manage user details based on role
 * Provides CRUD operations for Consumer and Supplier details
 */
@Injectable({
  providedIn: 'root'
})
export class UserDetailsService {
  constructor(
    private authService: AuthService,
    private consumerDetailsApi: DetailsConsumerApiEndpoint,
    private supplierDetailsApi: DetailsSupplierApiEndpoint
  ) {}

  /**
   * Get consumer details for current user
   */
  getConsumerDetails(userId?: number): Observable<DetailsConsumer | null> {
    const id = userId ?? this.authService.getCurrentUserId();
    if (!id) {
      return throwError(() => new Error('No user ID provided'));
    }

    return this.consumerDetailsApi.getByUserId(id).pipe(
      map(resource => this.consumerDetailsApi.toEntity(resource)),
      catchError(error => {
        console.warn('[UserDetailsService] Consumer details not found:', error);
        return of(null);
      })
    );
  }

  /**
   * Create consumer details for current user
   */
  createConsumerDetails(details: DetailsConsumer, userId?: number): Observable<DetailsConsumer> {
    const id = userId ?? this.authService.getCurrentUserId();
    if (!id) {
      return throwError(() => new Error('No user ID provided'));
    }

    const request = this.consumerDetailsApi.toRequest(details);
    return this.consumerDetailsApi.create(id, request).pipe(
      map(resource => this.consumerDetailsApi.toEntity(resource))
    );
  }

  /**
   * Update consumer details for current user
   */
  updateConsumerDetails(details: DetailsConsumer, userId?: number): Observable<DetailsConsumer> {
    const id = userId ?? this.authService.getCurrentUserId();
    if (!id) {
      return throwError(() => new Error('No user ID provided'));
    }

    const request = this.consumerDetailsApi.toRequest(details);
    return this.consumerDetailsApi.update(id, request).pipe(
      map(resource => this.consumerDetailsApi.toEntity(resource))
    );
  }

  /**
   * Get supplier/owner details for current user
   */
  getSupplierDetails(userId?: number): Observable<DetailsSupplier | null> {
    const id = userId ?? this.authService.getCurrentUserId();
    if (!id) {
      return throwError(() => new Error('No user ID provided'));
    }

    return this.supplierDetailsApi.getByUserId(id).pipe(
      map(resource => this.supplierDetailsApi.toEntity(resource)),
      catchError(error => {
        console.warn('[UserDetailsService] Supplier details not found:', error);
        return of(null);
      })
    );
  }

  /**
   * Create supplier/owner details for current user
   */
  createSupplierDetails(details: DetailsSupplier, userId?: number): Observable<DetailsSupplier> {
    const id = userId ?? this.authService.getCurrentUserId();
    if (!id) {
      return throwError(() => new Error('No user ID provided'));
    }

    const request = this.supplierDetailsApi.toRequest(details);
    return this.supplierDetailsApi.create(id, request).pipe(
      map(resource => this.supplierDetailsApi.toEntity(resource))
    );
  }

  /**
   * Update supplier/owner details for current user
   */
  updateSupplierDetails(details: DetailsSupplier, userId?: number): Observable<DetailsSupplier> {
    const id = userId ?? this.authService.getCurrentUserId();
    if (!id) {
      return throwError(() => new Error('No user ID provided'));
    }

    const request = this.supplierDetailsApi.toRequest(details);
    return this.supplierDetailsApi.update(id, request).pipe(
      map(resource => this.supplierDetailsApi.toEntity(resource))
    );
  }

  /**
   * Get details based on current user role
   * Returns consumer details if CONSUMER, supplier details if OWNER
   */
  getCurrentUserDetails(): Observable<DetailsConsumer | DetailsSupplier | null> {
    const role = this.authService.getCurrentUserRole();
    const userId = this.authService.getCurrentUserId();

    if (!userId) {
      return of(null);
    }

    if (role === 'CONSUMER') {
      return this.getConsumerDetails(userId);
    } else if (role === 'OWNER') {
      return this.getSupplierDetails(userId);
    }

    return of(null);
  }

  /**
   * Create or update details based on current user role
   */
  saveDetails(details: DetailsConsumer | DetailsSupplier): Observable<any> {
    const role = this.authService.getCurrentUserRole();
    const userId = this.authService.getCurrentUserId();

    if (!userId) {
      return throwError(() => new Error('No authenticated user'));
    }

    if (role === 'CONSUMER') {
      // Try to update first, if it fails, create
      return this.updateConsumerDetails(details as DetailsConsumer, userId).pipe(
        catchError(() => this.createConsumerDetails(details as DetailsConsumer, userId))
      );
    } else if (role === 'OWNER') {
      // Try to update first, if it fails, create
      return this.updateSupplierDetails(details as DetailsSupplier, userId).pipe(
        catchError(() => this.createSupplierDetails(details as DetailsSupplier, userId))
      );
    }

    return throwError(() => new Error('Invalid user role'));
  }
}

