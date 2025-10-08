import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../../environments/environment';

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
  imports: [CommonModule, RouterLink],
  templateUrl: './favoritos.component.html',
  styleUrls: ['./favoritos.component.css'],
})


export class FavoritosComponent implements OnInit {
  private API = environment.platformProviderApiBaseUrl;

  loading = false;
  offers: Offer[] = [];

  /**
   * crea una instancia del componente 'favoritoscomponent''
   * @param http
   */
  constructor(private http: HttpClient) {}

  /**
   * Carga las ofertas favoritas del usuario
   * @returns {void}
   */
  ngOnInit(): void {
    this.fetch();
  }

  /**
   * Obtiene los favoritos del usuario y recupera las ofertas segun el id sel usuario
   */
  fetch() {
    this.loading = true;
    this.http.get<any[]>(`${this.API}/favorites?userId=1`).subscribe({
      next: (rows) => {
        const ids = rows.map(r => r.offerId);
        if (!ids.length) { this.offers = []; this.loading = false; return; }

        const qs = ids.map(id => `id=${id}`).join('&');
        this.http.get<Offer[]>(`${this.API}/offers?${qs}`).subscribe({
          next: (list) => {
            const map = new Map(list.map(o => [o.id, o]));
            this.offers = ids.map(id => map.get(id)!).filter(Boolean);
            this.loading = false;
          },
          error: () => this.loading = false
        });
      },
      error: () => this.loading = false
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
    this.http.get<any[]>(`${this.API}/favorites?userId=1&offerId=${o.id}`).subscribe(rows => {
      if (!rows.length) return;
      this.http.delete(`${this.API}/favorites/${rows[0].id}`).subscribe(() => {
        this.offers = this.offers.filter(x => x.id !== o.id);
      });
    });
  }
}
