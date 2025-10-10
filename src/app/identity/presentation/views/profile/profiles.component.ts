import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../infrastructure/auth/auth.service';
import { User } from '../../../domain/model/user.entity';
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
  favoriteCount: number = 0;

  /**
   * Initializes ProfilesComponent with AuthService and FavoritesApiEndpoint.
   * @param authService Service for user authentication and data
   * @param favoritesApi Service for retrieving user favorites
   */
  constructor(
    private authService: AuthService,
    private favoritesApi: FavoritesApiEndpoint
  ) {}

  /**
   * Lifecycle hook that runs on component initialization.
   * Loads current user and fetches favorite count.
   */
  ngOnInit() {
    this.user = this.authService.getCurrentUser();

    if (this.user?.id) {
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
    }
  }

  /**
   * Returns the first letter of the user's name in uppercase for avatar display.
   */
  get avatar(): string {
    return this.user?.name ? this.user.name.charAt(0).toUpperCase() : '';
  }

  /**
   * Returns a formatted string with the user's saved places (home, work, university).
   */
  get places(): string {
    if (!this.user) return '';
    const home = this.user.home ? `Home: ${this.user.home}` : '';
    const work = this.user.work ? `Work: ${this.user.work}` : '';
    const university = this.user.university ? `University: ${this.user.university}` : '';
    return [home, work, university].filter(Boolean).join('<br>');
  }
}
