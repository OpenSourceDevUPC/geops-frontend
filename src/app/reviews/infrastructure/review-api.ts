import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap, forkJoin, switchMap, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { Review } from '../domain/model/review.entity';
import { ReviewApiEndpoint } from './review-api-endpoint';
import { environment } from '../../../environments/environment';

/**
 * Review API Service
 *
 * Infrastructure service for managing review data and state.
 * Provides reactive state management using BehaviorSubjects.
 */
@Injectable({ providedIn: 'root' })
export class ReviewApi extends BaseApi {
  private readonly endpoint: ReviewApiEndpoint;
  private reviewsSubject = new BehaviorSubject<Review[]>([]);
  public reviews$ = this.reviewsSubject.asObservable();

  constructor(private http: HttpClient) {
    super();
    this.endpoint = new ReviewApiEndpoint(http);
  }

  getAllReviews(): Observable<Review[]> {
    return this.endpoint
      .getAll()
      .pipe(tap((reviews: Review[]) => this.reviewsSubject.next(reviews)));
  }

  getReviewsByOfferId(offerId: number): Observable<Review[]> {
    return this.endpoint.getByOfferId(offerId).pipe(
      tap((reviews: Review[]) => this.reviewsSubject.next(reviews))
    );
  }

  getReviewsByUserId(userId: number): Observable<Review[]> {
    return this.endpoint.getAll().pipe(
      map((reviews: Review[]) => reviews.filter((r) => r.userId === userId)),
      tap((filtered) => this.reviewsSubject.next(filtered))
    );
  }

  createReview(review: Omit<Review, 'id'>): Observable<Review> {
    return this.endpoint
      .createReview(review as Review)
      .pipe(tap((r) => this.reviewsSubject.next([...this.reviewsSubject.value, r])));
  }

  /**
   * Get reviews filtered by user's campaigns.
   *
   * This method performs cross-bounded-context filtering:
   * 1. Gets user's campaigns from the campaign endpoint
   * 2. Gets all offers from those campaigns
   * 3. Filters all reviews to show only those matching the offer IDs
   *
   * @param userId user id to filter reviews by campaigns
   */
  getReviewsByUserCampaigns(userId: number): Observable<Review[]> {
    const campaignsUrl = `${environment.platformProviderApiBaseUrl}/campaigns/user/${encodeURIComponent(
      userId
    )}`;

    return this.http.get<any[]>(campaignsUrl).pipe(
      switchMap((campaigns) => {
        if (campaigns.length === 0) {
          return of([]);
        }

        // Get all offers for each campaign
        const offerRequests = campaigns.map((campaign) =>
          this.http.get<any[]>(
            `${environment.platformProviderApiBaseUrl}/offers/campaign/${campaign.id}`
          )
        );

        return forkJoin(offerRequests).pipe(
          map((offersArrays) => {
            // Flatten the arrays of offers
            const allOffers = offersArrays.flat();
            return allOffers.map((offer) => offer.id);
          })
        );
      }),
      switchMap((offerIds) => {
        if (offerIds.length === 0) {
          return of([]);
        }

        return this.endpoint.getAll().pipe(
          map((reviews) => reviews.filter((review) => offerIds.includes(review.offerId)))
        );
      }),
      tap((reviews: Review[]) => this.reviewsSubject.next(reviews))
    );
  }
}
