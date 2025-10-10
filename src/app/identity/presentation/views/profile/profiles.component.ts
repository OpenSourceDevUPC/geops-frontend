import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../infrastructure/auth/auth.service';
import { User } from '../../../domain/model/user.entity';
import { FavoritesApiEndpoint } from '../../../../loyalty/infrastructure/favorites/favorites-api-endpoint';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';

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

  constructor(
    private authService: AuthService,
    private favoritesApi: FavoritesApiEndpoint
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();

    if (this.user?.id) {

      this.favoritesApi.getByUser(this.user.id).subscribe({
        next: (favoriteRows) => {
          this.favoriteCount = favoriteRows.length;
          console.log(`Usuario ${this.user?.name} tiene ${this.favoriteCount} favoritos`);
        },
        error: (err) => {
          console.error('Error al obtener favoritos:', err);
          this.favoriteCount = 0;
        }
      });
    }
  }

  get avatar(): string {
    return this.user?.name ? this.user.name.charAt(0).toUpperCase() : '';
  }

  get places(): string {
    if (!this.user) return '';
    const casa = this.user.home ? `Casa: ${this.user.home}` : '';
    const trabajo = this.user.work ? `Trabajo: ${this.user.work}` : '';
    const universidad = this.user.university ? `Universidad: ${this.user.university}` : '';
    return [casa, trabajo, universidad].filter(Boolean).join('<br>');
  }
}
