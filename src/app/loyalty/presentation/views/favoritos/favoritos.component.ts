import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoritesApiEndpoint } from '../../../infrastructure/favorites/favorites-api-endpoint';
import { OffersApiEndpoint } from '../../../infrastructure/offers/offers-api-endpoint';
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
   * crea una instancia del componente 'favoritoscomponent'
   */
  constructor(
    private favsApi: FavoritesApiEndpoint,
    private offersApi: OffersApiEndpoint,
    private authService: AuthService
  ) {}

  /**
   * Carga las ofertas favoritas del usuario
   * @returns {void}
   */
  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    console.log('[Favoritos] Usuario actual ID:', this.currentUserId);
    if (!this.currentUserId) {
      console.warn('[Favoritos] No hay usuario autenticado');
      // Opcional: redirigir al login
      // this.router.navigate(['/login']);
      return;
    }

    this.fetch();
  }

  /**
   * Obtiene los favoritos del usuario y recupera las ofertas según el id del usuario
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
        console.log('[Favoritos] IDs de ofertas favoritas:', ids);

        if (!ids.length) {
          this.offers = [];
          this.loading = false;
          return;
        }

        this.offersApi.getByIds(ids).subscribe({
          next: (list) => {
            const map = new Map(list.map((o) => [o.id, o]));
            this.offers = ids.map((id) => map.get(id)!).filter(Boolean) as Offer[];
            console.log('[Favoritos] Ofertas cargadas:', this.offers.length);
            this.loading = false;
          },
          error: () => (this.loading = false),
        });
      },
      error: () => (this.loading = false),
    });
  }

  /**
   * devuelve la url de la imagen asociada a una oferta
   * @param o
   */
  imgFor(o: Offer) { return o.imageUrl ?? `assets/offers/${o.id}.jpg`; }

  /**
   * Elimina la oferta de la lista de favoritos del usuario
   * @param o
   */
  remove(o: Offer) {
    if (!this.currentUserId) return;

    this.favsApi.findRow(this.currentUserId, o.id).subscribe((rows) => {
      if (!rows.length) return;

      this.favsApi.removeRow(rows[0].id!).subscribe(() => {
        this.offers = this.offers.filter((x) => x.id !== o.id);
        console.log('[Favoritos] Favorito eliminado:', o.id);
      });
    });
  }
}
