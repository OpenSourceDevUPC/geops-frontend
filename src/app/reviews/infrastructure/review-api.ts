import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, tap, of, map } from 'rxjs';
import { Review } from '../domain/model/review.entity';
import { ReviewApiEndpoint } from './review-api-endpoint';

/**
 * Review API Service
 * 
 * Infrastructure service for managing review data and state.
 * Provides reactive state management using BehaviorSubjects.
 */
@Injectable({
  providedIn: 'root'
})
export class ReviewApi {
  private readonly endpoint = inject(ReviewApiEndpoint);

  // State management with BehaviorSubjects
  private reviewsSubject = new BehaviorSubject<Review[]>([]);
  private selectedReviewSubject = new BehaviorSubject<Review | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Public observables
  public reviews$ = this.reviewsSubject.asObservable();
  public selectedReview$ = this.selectedReviewSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  /**
   * Get all reviews for a specific offer
   */
  getReviewsByOfferId(offerId: number): Observable<Review[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.endpoint.getByOfferId(offerId).pipe(
      tap(reviews => {
        this.reviewsSubject.next(reviews);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        return of([]);
      })
    );
  }

  /**
   * Get a single review by ID
   */
  getReviewById(id: number): Observable<Review | null> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.endpoint.getById(id).pipe(
      tap(review => {
        this.selectedReviewSubject.next(review);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        return of(null);
      })
    );
  }

  /**
   * Create a new review
   */
  createReview(review: Partial<Review>): Observable<Review | null> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.endpoint.createReview(review).pipe(
      tap(newReview => {
        const currentReviews = this.reviewsSubject.value;
        this.reviewsSubject.next([...currentReviews, newReview]);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        return of(null);
      })
    );
  }

  /**
   * Update an existing review
   */
  updateReview(id: number, review: Partial<Review>): Observable<Review | null> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.endpoint.updateReview(id, review).pipe(
      tap(updatedReview => {
        const currentReviews = this.reviewsSubject.value;
        const index = currentReviews.findIndex(r => r.id === id);
        if (index !== -1) {
          currentReviews[index] = updatedReview;
          this.reviewsSubject.next([...currentReviews]);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        return of(null);
      })
    );
  }

  /**
   * Delete a review
   */
  deleteReview(id: number): Observable<boolean> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.endpoint.deleteReview(id).pipe(
      tap(() => {
        const currentReviews = this.reviewsSubject.value;
        this.reviewsSubject.next(currentReviews.filter(r => r.id !== id));
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        return of(false);
      }),
      map(() => true)
    );
  }

  /**
   * Increment likes for a review
   */
  incrementLikes(id: number): Observable<Review | null> {
    return this.endpoint.incrementLikes(id).pipe(
      tap(updatedReview => {
        const currentReviews = this.reviewsSubject.value;
        const index = currentReviews.findIndex(r => r.id === id);
        if (index !== -1) {
          currentReviews[index] = updatedReview;
          this.reviewsSubject.next([...currentReviews]);
        }
        if (this.selectedReviewSubject.value?.id === id) {
          this.selectedReviewSubject.next(updatedReview);
        }
      }),
      catchError(error => {
        this.errorSubject.next(error.message);
        return of(null);
      })
    );
  }

  /**
   * Clear reviews state
   */
  clearReviews(): void {
    this.reviewsSubject.next([]);
  }

  /**
   * Clear selected review
   */
  clearSelectedReview(): void {
    this.selectedReviewSubject.next(null);
  }

  /**
   * Get current reviews value (non-reactive)
   */
  getCurrentReviews(): Review[] {
    return this.reviewsSubject.value;
  }

  /**
   * Get current selected review value (non-reactive)
   */
  getCurrentSelectedReview(): Review | null {
    return this.selectedReviewSubject.value;
  }
}
