import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Review } from '../../domain/model/review.entity';
import { ReviewApi } from '../../infrastructure/review-api';

/**
 * Review Service (Presentation Layer)
 * 
 * Provides business logic and state management for reviews.
 * Acts as a facade between UI components and infrastructure layer.
 */
@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly api = inject(ReviewApi);

  // Expose observables from infrastructure layer
  public reviews$ = this.api.reviews$;
  public selectedReview$ = this.api.selectedReview$;
  public loading$ = this.api.loading$;
  public error$ = this.api.error$;

  /**
   * Load all reviews for a specific offer
   */
  loadReviewsByOfferId(offerId: number): void {
    this.api.getReviewsByOfferId(offerId).subscribe();
  }

  /**
   * Load a single review by ID
   */
  loadReviewById(id: number): void {
    this.api.getReviewById(id).subscribe();
  }

  /**
   * Create a new review
   */
  createReview(review: Partial<Review>): Observable<Review | null> {
    return this.api.createReview(review);
  }

  /**
   * Update an existing review
   */
  updateReview(id: number, review: Partial<Review>): Observable<Review | null> {
    return this.api.updateReview(id, review);
  }

  /**
   * Delete a review
   */
  deleteReview(id: number): Observable<boolean> {
    return this.api.deleteReview(id);
  }

  /**
   * Increment likes for a review
   */
  likeReview(id: number): void {
    this.api.incrementLikes(id).subscribe();
  }

  /**
   * Clear all reviews from state
   */
  clearReviews(): void {
    this.api.clearReviews();
  }

  /**
   * Clear selected review from state
   */
  clearSelectedReview(): void {
    this.api.clearSelectedReview();
  }

  /**
   * Get current reviews (non-reactive)
   */
  getCurrentReviews(): Review[] {
    return this.api.getCurrentReviews();
  }

  /**
   * Calculate average rating from reviews
   */
  calculateAverageRating(reviews: Review[]): number {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  }

  /**
   * Group reviews by rating
   */
  groupReviewsByRating(reviews: Review[]): Map<number, Review[]> {
    const grouped = new Map<number, Review[]>();
    
    for (let rating = 1; rating <= 5; rating++) {
      grouped.set(rating, []);
    }
    
    reviews.forEach(review => {
      const group = grouped.get(review.rating);
      if (group) {
        group.push(review);
      }
    });
    
    return grouped;
  }

  /**
   * Get review statistics for an offer
   */
  getReviewStatistics(reviews: Review[]): {
    total: number;
    averageRating: number;
    totalLikes: number;
    ratingDistribution: { rating: number; count: number; percentage: number }[];
  } {
    const total = reviews.length;
    const averageRating = this.calculateAverageRating(reviews);
    const totalLikes = reviews.reduce((acc, review) => acc + review.likes, 0);
    
    const ratingCounts = new Map<number, number>();
    for (let rating = 1; rating <= 5; rating++) {
      ratingCounts.set(rating, 0);
    }
    
    reviews.forEach(review => {
      const count = ratingCounts.get(review.rating) || 0;
      ratingCounts.set(review.rating, count + 1);
    });
    
    const ratingDistribution = Array.from(ratingCounts.entries()).map(([rating, count]) => ({
      rating,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    })).reverse(); // Show 5 stars first
    
    return {
      total,
      averageRating,
      totalLikes,
      ratingDistribution
    };
  }

  /**
   * Sort reviews by criteria
   */
  sortReviews(reviews: Review[], sortBy: 'date' | 'rating' | 'likes'): Review[] {
    const sorted = [...reviews];
    
    switch (sortBy) {
      case 'date':
        return sorted.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'likes':
        return sorted.sort((a, b) => b.likes - a.likes);
      default:
        return sorted;
    }
  }

  /**
   * Filter reviews by minimum rating
   */
  filterByRating(reviews: Review[], minRating: number): Review[] {
    return reviews.filter(review => review.rating >= minRating);
  }
}
