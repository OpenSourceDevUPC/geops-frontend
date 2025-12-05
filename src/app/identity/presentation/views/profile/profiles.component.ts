import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../infrastructure/auth/auth.service';
import { User } from '../../../domain/model/user.entity';
import { DetailsConsumer } from '../../../domain/model/details-consumer.entity';
import { DetailsConsumerService } from '../../../infrastructure/users/details-consumer.service';
import { FavoritesApiEndpoint } from '../../../../loyalty/infrastructure/favorites/favorites-api-endpoint';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

/**
 * ProfilesComponent displays user profile information and favorite count.
 * Fetches user data and favorites on initialization.
 */
@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule, TranslateModule],
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.css']
})
export class ProfilesComponent implements OnInit {
  user: User | null = null;
  consumerDetails: DetailsConsumer | null = null;
  favoriteCount: number = 0;

  /**
   * Initializes ProfilesComponent with AuthService and FavoritesApiEndpoint.
   * @param authService Service for user authentication and data
   * @param favoritesApi Service for retrieving user favorites
   * @param detailsConsumerService Service for retrieving consumer details
   */
  constructor(
    private authService: AuthService,
    private favoritesApi: FavoritesApiEndpoint,
    private detailsConsumerService: DetailsConsumerService
  ) {}

  /**
   * Lifecycle hook that runs on component initialization.
   * Loads current user and fetches favorite count.
   */
  ngOnInit() {
    this.user = this.authService.getCurrentUser();

    if (this.user?.id) {
      // Load favorites count
      this.favoritesApi.getByUser(this.user.id).subscribe({
        next: (favoriteRows) => {
          this.favoriteCount = favoriteRows.length;
          console.log(`User ${this.user?.name} has ${this.favoriteCount} favorites`);
        },
        error: (err) => {
          console.error('Error fetching favorites:', err);
          this.favoriteCount = 0;
        }
      });

      // Load consumer details if user is a consumer
      if (this.user.role === 'CONSUMER') {
        this.detailsConsumerService.getByUserId(this.user.id).subscribe({
          next: (details) => {
            this.consumerDetails = details;
            console.log('[ProfileComponent] Consumer details loaded:', details);
          },
          error: (err) => {
            console.error('Error fetching consumer details:', err);
            this.consumerDetails = null;
          }
        });
      }
    }
  }

  /**
   * Returns the first letter of the user's name in uppercase for avatar display.
   */
  get avatar(): string {
    return this.user?.name ? this.user.name.charAt(0).toUpperCase() : '';
  }

  /**
   * Returns the location permission status.
   * This getter is used in the component template (profiles.component.html).
   */
  get locationPermission(): string {
    if (!this.consumerDetails) return 'ASK';
    return this.consumerDetails.permisoUbicacion ? 'ALWAYS' : 'ASK';
  }

  /**
   * Returns a formatted string with the user's saved places (home, work, university).
   */
  get places(): string {
    if (!this.consumerDetails) return '';
    const home = this.consumerDetails.direccionCasa ? `Casa: ${this.consumerDetails.direccionCasa}` : '';
    const work = this.consumerDetails.direccionTrabajo ? `Trabajo: ${this.consumerDetails.direccionTrabajo}` : '';
    const university = this.consumerDetails.direccionUniversidad ? `Universidad: ${this.consumerDetails.direccionUniversidad}` : '';
    return [home, work, university].filter(Boolean).join('<br>');
  }
}
