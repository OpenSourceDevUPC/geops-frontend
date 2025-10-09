import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoritesApiEndpoint } from '../../../infrastructure/favorites-api-endpoint';
import { OffersApiEndpoint } from '../../../infrastructure/offers-api-endpoint';
import { TranslateModule } from '@ngx-translate/core';

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

  /**
   * crea una instancia del componente 'favoritoscomponent'
   */
  constructor(
    private favsApi: FavoritesApiEndpoint,
    private offersApi: OffersApiEndpoint
  ) {}

  /**
   * Carga las ofertas favoritas del usuario
   * @returns {void}
   */
  ngOnInit(): void {
    this.fetch();
  }

  /**
   * Obtiene los favoritos del usuario y recupera las ofertas según el id del usuario
   */
  fetch() {
    this.loading = true;

    this.favsApi.getByUser(1).subscribe({
      next: (rows) => {
        const ids = rows.map((r) => r.offerId);
        if (!ids.length) { this.offers = []; this.loading = false; return; }

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
   * devuelve la url de la imagen asociada a una oferta
   * @param o
   */
  imgFor(o: Offer) { return o.imageUrl ?? `assets/offers/${o.id}.jpg`; }

  /**
   * Elimina la oferta de la lista de favoritos del usuario
   * @param o
   */
  remove(o: Offer) {
    this.favsApi.findRow(1, o.id).subscribe((rows) => {
      if (!rows.length) return;
      this.favsApi.removeRow(rows[0].id).subscribe(() => {
        this.offers = this.offers.filter((x) => x.id !== o.id);
      });
    });
  }
}
