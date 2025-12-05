import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ReviewService } from '../../../../reviews/presentation/services/review.service';
import { Review } from '../../../../reviews/domain/model/review.entity';
import { AuthService } from '../../../../identity/infrastructure/auth/auth.service';

@Component({
  selector: 'app-comentarios',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './comentarios.component.html',
  styleUrls: ['./comentarios.component.css']
})
export class ComentariosComponent implements OnInit, OnDestroy {
  private readonly reviewService = inject(ReviewService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);
  private readonly authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  reviews: Review[] = [];
  filteredReviews: Review[] = [];
  statistics: any = null;
  loading = false;
  error: string | null = null;
  offerId: number = 0;
  
  reviewForm: FormGroup;
  sortBy: 'date' | 'rating' | 'likes' = 'date';
  filterRating: number = 0;
  showForm = false;

  constructor() {
    this.reviewForm = this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      text: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]]
    });
  }

  ngOnInit(): void {
    // Get offerId from route params or use default for testing
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.offerId = params['offerId'] ? +params['offerId'] : 1;
      this.loadReviews();
    });

    // Subscribe to reviews changes
    this.reviewService.reviews$
      .pipe(takeUntil(this.destroy$))
      .subscribe((reviews: Review[]) => {
        this.reviews = reviews;
        this.applyFiltersAndSort();
        this.statistics = this.reviewService.getReviewStatistics(reviews);
      });

    // Subscribe to loading state
    this.reviewService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading: boolean) => this.loading = loading);

    // Subscribe to error state
    this.reviewService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe((error: string | null) => this.error = error);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReviews(): void {
    this.reviewService.loadReviewsByOfferId(this.offerId);
  }

  onSubmitReview(): void {
    if (this.reviewForm.invalid) {
      return;
    }

    const review = {
      offerId: this.offerId,
      userId: this.getUserId(),
      userName: this.getUserName(),
      rating: this.reviewForm.value.rating,
      text: this.reviewForm.value.text
    };

    this.reviewService.createReview(review).subscribe({
      next: (createdReview) => {
        if (createdReview) {
          this.snackBar.open('Reseña creada exitosamente', 'Cerrar', { duration: 3000 });
          this.reviewForm.reset({ rating: 5, text: '' });
          this.showForm = false;
        }
      },
      error: (err) => {
        this.snackBar.open('Error al crear reseña: ' + err.message, 'Cerrar', { duration: 5000 });
      }
    });
  }

  onLike(reviewId: number): void {
    this.reviewService.likeReview(reviewId);
  }

  onDelete(reviewId: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta reseña?')) {
      this.reviewService.deleteReview(reviewId).subscribe({
        next: (success) => {
          if (success) {
            this.snackBar.open('Reseña eliminada', 'Cerrar', { duration: 3000 });
          }
        },
        error: (err) => {
          this.snackBar.open('Error al eliminar reseña', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  onSortChange(): void {
    this.applyFiltersAndSort();
  }

  onFilterChange(): void {
    this.applyFiltersAndSort();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  private applyFiltersAndSort(): void {
    let filtered = [...this.reviews];
    
    if (this.filterRating > 0) {
      filtered = this.reviewService.filterByRating(filtered, this.filterRating);
    }
    
    this.filteredReviews = this.reviewService.sortReviews(filtered, this.sortBy);
  }

  getUserId(): number {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('No authenticated user found');
    }
    return userId;
  }

  getUserName(): string {
    const user = this.authService.getCurrentUser();
    return user?.name || 'Usuario';
  }

  getRatingArray(rating: number): number[] {
    return Array(rating).fill(0);
  }

  getEmptyStarsArray(rating: number): number[] {
    return Array(5 - rating).fill(0);
  }
}
