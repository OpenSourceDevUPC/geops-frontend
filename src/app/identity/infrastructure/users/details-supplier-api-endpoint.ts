import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DetailsSupplier } from '../../domain/model/user.entity';

/**
 * Supplier/Owner details resource from API
 */
export interface DetailsSupplierResource {
  id?: number;
  userId?: number;
  businessName?: string;
  businessType?: string;
  taxId?: string;
  website?: string;
  description?: string;
  address?: string;
  horarioAtencion?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Create supplier details request
 */
export interface CreateDetailsSupplierRequest {
  businessName?: string;
  businessType?: string;
  taxId?: string;
  website?: string;
  description?: string;
  address?: string;
  horarioAtencion?: string;
}

/**
 * API Endpoint for supplier/owner details operations
 * Manages business-specific profile information for OWNER role users
 */
@Injectable({ providedIn: 'root' })
export class DetailsSupplierApiEndpoint {
  private baseUrl = `${environment.platformProviderApiBaseUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Get owner/supplier details for a user
   * GET /api/v1/users/{userId}/owner-details
   */
  getByUserId(userId: number): Observable<DetailsSupplierResource> {
    return this.http.get<DetailsSupplierResource>(`${this.baseUrl}/${userId}/owner-details`);
  }

  /**
   * Create owner/supplier details for a user
   * POST /api/v1/users/{userId}/owner-details
   */
  create(userId: number, details: CreateDetailsSupplierRequest): Observable<DetailsSupplierResource> {
    return this.http.post<DetailsSupplierResource>(
      `${this.baseUrl}/${userId}/owner-details`,
      details
    );
  }

  /**
   * Update owner/supplier details for a user
   * PUT /api/v1/users/{userId}/owner-details
   */
  update(userId: number, details: CreateDetailsSupplierRequest): Observable<DetailsSupplierResource> {
    return this.http.put<DetailsSupplierResource>(
      `${this.baseUrl}/${userId}/owner-details`,
      details
    );
  }

  /**
   * Convert resource to entity
   */
  toEntity(resource: DetailsSupplierResource): DetailsSupplier {
    return {
      id: resource.id,
      businessName: resource.businessName,
      businessType: resource.businessType,
      taxId: resource.taxId,
      website: resource.website,
      description: resource.description,
      address: resource.address,
      horarioAtencion: resource.horarioAtencion
    };
  }

  /**
   * Convert entity to request
   */
  toRequest(entity: DetailsSupplier): CreateDetailsSupplierRequest {
    return {
      businessName: entity.businessName,
      businessType: entity.businessType,
      taxId: entity.taxId,
      website: entity.website,
      description: entity.description,
      address: entity.address,
      horarioAtencion: entity.horarioAtencion
    };
  }
}

