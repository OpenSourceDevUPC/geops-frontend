import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
   * Get all reviews for a specific offer
   */
  getByOfferId(offerId: number): Observable<Review[]> {
    return this.http
      .get<ReviewResource[]>(`${this.endpointUrl}/offer/${offerId}`)
      .pipe(
        map(resources => resources.map(r => this.assembler.toEntityFromResource(r)))
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
        map(r => this.assembler.toEntityFromResource(r))
      );
  }

  /**
   * Update an existing review
   */
  updateReview(id: number, review: Partial<Review>): Observable<Review> {
    const resource = this.assembler.toUpdateResource(review);
    return this.http
      .put<ReviewResource>(`${this.endpointUrl}/${id}`, resource)
      .pipe(
        map(r => this.assembler.toEntityFromResource(r))
      );
  }

  /**
   * Delete a review
   */
  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpointUrl}/${id}`);
  }

  /**
   * Increment likes for a review
   */
  incrementLikes(id: number): Observable<Review> {
    return this.http
      .patch<ReviewResource>(`${this.endpointUrl}/${id}/like`, {})
      .pipe(
        map(r => this.assembler.toEntityFromResource(r))
      );
  }
}
