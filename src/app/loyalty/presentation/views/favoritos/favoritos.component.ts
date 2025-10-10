import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoritesApiEndpoint } from '../../../infrastructure/favorites-api-endpoint';
import { OffersApiEndpoint } from '../../../infrastructure/offers-api-endpoint';
import { TranslateModule } from '@ngx-translate/core';
import {AuthService} from '../../../infrastructure/auth/auth.service';

type Offer = {
  id: number;
  title: string;
  partner: string;
  price: number;
  codePrefix: string;
  validTo: string;
  rating: number;
  location: string;
  category: string;
  imageUrl?: string;
};

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './favoritos.component.html',
  styleUrls: ['./favoritos.component.css'],
})
export class FavoritosComponent implements OnInit {
  loading = false;
  offers: Offer[] = [];
  private currentUserId: number | null = null;

  /**
   * creates an instance of the 'favoritescomponent' component
   */
  constructor(
    private favsApi: FavoritesApiEndpoint,
    private offersApi: OffersApiEndpoint,
    private authService: AuthService
  ) {}

  /**
   * load the users favorite offers
   * @returns {void}
   */
  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    console.log('[Favoritos] Usuario actual ID:', this.currentUserId);
    if (!this.currentUserId) {
      console.warn('[Favoritos] No hay usuario autenticado');
      return;
    }

    this.fetch();
  }

  /**
   * gets the users favorites and retrieves offers based on the users ID.
   */
  fetch() {
    if (!this.currentUserId) {
      this.offers = [];
      return;
    }

    this.loading = true;

    this.favsApi.getByUser(this.currentUserId).subscribe({
      next: (rows) => {
        const ids = rows.map((r) => r.offerId);

        if (!ids.length) {
          this.offers = [];
          this.loading = false;
          return;
        }

        this.offersApi.getByIds(ids).subscribe({
          next: (list) => {
            const map = new Map(list.map((o) => [o.id, o]));
            this.offers = ids.map((id) => map.get(id)!).filter(Boolean) as Offer[];
            this.loading = false;
          },
          error: () => (this.loading = false),
        });
      },
      error: () => (this.loading = false),
    });
  }

  /**
   * Returns the URL of the image associated with an offer.
   * @param o - offer
   */
  imgFor(o: Offer) { return o.imageUrl ?? `assets/offers/${o.id}.jpg`; }

  /**
   * removes the offer from the user's favorites list
   * @param o - offer you want to remove from favorites
   */
  remove(o: Offer) {
    if (!this.currentUserId) return;

    this.favsApi.findRow(this.currentUserId, o.id).subscribe((rows) => {
      if (!rows.length) return;

      this.favsApi.removeRow(rows[0].id!).subscribe(() => {
        this.offers = this.offers.filter((x) => x.id !== o.id);
      });
    });
  }
}
