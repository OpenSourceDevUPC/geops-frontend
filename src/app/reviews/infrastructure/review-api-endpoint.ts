import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Review } from '../domain/model/review.entity';
import {
  ReviewResource,
  ReviewResponse,
  CreateReviewResource,
  UpdateReviewResource
} from './review-response';
import { ReviewAssembler } from './review-assembler';
import { environment } from '../../../environments/environment';

/**
 * Review API Endpoint
 *
 * Handles HTTP requests to the Reviews API.
 * Provides methods for CRUD operations on reviews.
 */
@Injectable({
  providedIn: 'root'
})
export class ReviewApiEndpoint extends BaseApiEndpoint<
  Review,
  ReviewResource,
  ReviewResponse,
  ReviewAssembler
> {

  constructor(http: HttpClient) {
    super(
      http,
      `${environment.platformProviderApiBaseUrl}/reviews`,
      new ReviewAssembler()
    );
  }

  /**
   * Get all reviews (to be filtered client-side)
   * Backend returns array directly, not wrapped in response object
   */
  getAllOffers(): Observable<Review[]> {
    return this.http
      .get<ReviewResource[]>(this.endpointUrl)
      .pipe(
        map(resources => {
          // Handle both array and wrapped responses
          if (!resources) return [];
          if (Array.isArray(resources)) {
            return resources.map(r => this.assembler.toEntityFromResource(r));
          }
          // If wrapped in data property (fallback)
          const wrapped = resources as any;
          if (wrapped.data && Array.isArray(wrapped.data)) {
            return wrapped.data.map((r: ReviewResource) => this.assembler.toEntityFromResource(r));
          }
          return [];
        }),
        catchError(error => {
          console.error('[ReviewApiEndpoint] Error fetching all reviews:', error);
          throw error;
        })
      );
  }

  /**
   * Get all reviews for a specific offer (filtered client-side)
   */
  getByOfferId(offerId: number): Observable<Review[]> {
    return this.getAll().pipe(
      map(reviews => reviews.filter(r => r.offerId === offerId))
    );
  }

  /**
   * Get all reviews by user ID (filtered client-side)
   */
  getByUserId(userId: number): Observable<Review[]> {
    return this.getAll().pipe(
      map(reviews => reviews.filter(r => r.userId === userId))
    );
  }

  /**
   * Create a new review
   */
  createReview(review: Partial<Review>): Observable<Review> {
    const resource = this.assembler.toCreateResource(review);
    return this.http
      .post<ReviewResource>(this.endpointUrl, resource)
      .pipe(
        map(r => this.assembler.toEntityFromResource(r)),
        catchError(error => {
          console.error('[ReviewApiEndpoint] Error creating review:', error);
          throw error;
        })
      );
  }

  /**
   * Update an existing review (PATCH)
   */
  updateReview(id: number, review: Partial<Review>): Observable<Review> {
    const resource = this.assembler.toUpdateResource(review);
    return this.http
      .patch<ReviewResource>(`${this.endpointUrl}/${id}`, resource)
      .pipe(
        map(r => this.assembler.toEntityFromResource(r)),
        catchError(error => {
          console.error('[ReviewApiEndpoint] Error updating review:', error);
          throw error;
        })
      );
  }

  /**
   * Delete a review
   */
  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpointUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error('[ReviewApiEndpoint] Error deleting review:', error);
          throw error;
        })
      );
  }
}
