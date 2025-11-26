import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DetailsConsumer } from '../../domain/model/user.entity';

/**
 * Consumer details resource from API
 */
export interface DetailsConsumerResource {
  id?: number;
  userId?: number;
  categoriasFavoritas?: string;
  recibirNotificaciones?: boolean;
  permisoUbicacion?: boolean;
  direccionCasa?: string;
  direccionTrabajo?: string;
  direccionUniversidad?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Create consumer details request
 */
export interface CreateDetailsConsumerRequest {
  categoriasFavoritas?: string;
  recibirNotificaciones?: boolean;
  permisoUbicacion?: boolean;
  direccionCasa?: string;
  direccionTrabajo?: string;
  direccionUniversidad?: string;
}

/**
 * API Endpoint for consumer details operations
 * Manages consumer-specific profile information
 */
@Injectable({ providedIn: 'root' })
export class DetailsConsumerApiEndpoint {
  private baseUrl = `${environment.platformProviderApiBaseUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Get consumer details for a user
   * GET /api/v1/users/{userId}/consumer-details
   */
  getByUserId(userId: number): Observable<DetailsConsumerResource> {
    return this.http.get<DetailsConsumerResource>(`${this.baseUrl}/${userId}/consumer-details`);
  }

  /**
   * Create consumer details for a user
   * POST /api/v1/users/{userId}/consumer-details
   */
  create(userId: number, details: CreateDetailsConsumerRequest): Observable<DetailsConsumerResource> {
    return this.http.post<DetailsConsumerResource>(
      `${this.baseUrl}/${userId}/consumer-details`,
      details
    );
  }

  /**
   * Update consumer details for a user
   * PUT /api/v1/users/{userId}/consumer-details
   */
  update(userId: number, details: CreateDetailsConsumerRequest): Observable<DetailsConsumerResource> {
    return this.http.put<DetailsConsumerResource>(
      `${this.baseUrl}/${userId}/consumer-details`,
      details
    );
  }

  /**
   * Convert resource to entity
   */
  toEntity(resource: DetailsConsumerResource): DetailsConsumer {
    return {
      id: resource.id,
      categoriasFavoritas: resource.categoriasFavoritas,
      recibirNotificaciones: resource.recibirNotificaciones,
      permisoUbicacion: resource.permisoUbicacion,
      direccionCasa: resource.direccionCasa,
      direccionTrabajo: resource.direccionTrabajo,
      direccionUniversidad: resource.direccionUniversidad
    };
  }

  /**
   * Convert entity to request
   */
  toRequest(entity: DetailsConsumer): CreateDetailsConsumerRequest {
    return {
      categoriasFavoritas: entity.categoriasFavoritas,
      recibirNotificaciones: entity.recibirNotificaciones,
      permisoUbicacion: entity.permisoUbicacion,
      direccionCasa: entity.direccionCasa,
      direccionTrabajo: entity.direccionTrabajo,
      direccionUniversidad: entity.direccionUniversidad
    };
  }
}

