import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router} from '@angular/router';
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

type FavoriteRow = {
  id?: number;
  userId: number;
  offerId: number;
  createdAt: string;
};

@Component({
  selector: 'app-ofertas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ofertas.component.html',
  styleUrls: ['./ofertas.component.css'],
})


export class OfertasComponent implements OnInit, OnDestroy {
  private API = environment.platformProviderApiBaseUrl;

  loading = false;
  all: Offer[] = [];
  featured: Offer[] = [];
  filtered: Offer[] = [];

  categories: string[] = [];
  locations: string[] = [];

  idx = 0;
  timer?: any;

  /**
   * filttros de búsqueda
   */

  filters = {
    q: '',
    category: 'all',
    location: 'all',
    sort: 'relevance' as 'relevance' | 'priceAsc' | 'priceDesc' | 'ratingDesc',
  };

  private favSet = new Set<number>();

  private dataLoaded = false;

  /**
   * crea una instancia del componente ofertascomponent
   * @param http
   * @param route
   * @param router
   */

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  /**
   * obtiene las ofertas de la API
   * carga todo lo que tiene que tener ofertas
   * inicia el carrusel de las ofertas destacadas
   * recupera los favoritos del usuario
   */

  ngOnInit(): void {
    this.loading = true;

    this.http.get<Offer[]>(`${this.API}/offers`).subscribe({
      next: (offers) => {
        const order = [14, 8, 18, 21];
        this.all = offers;
        this.featured = order
          .map((id) => offers.find((o) => o.id === id))
          .filter((o): o is Offer => !!o);

        this.categories = Array.from(new Set(offers.map((o) => o.category))).sort();
        this.locations = Array.from(new Set(offers.map((o) => o.location))).sort();

        this.dataLoaded = true;
        this.applyFilters();
        this.loading = false;
        this.startAuto();
      },
      error: () => (this.loading = false),
    });

    this.fetchFavs();
  }

  /**
   * se ejecuta al destruir el componente
   * y tambien detiene el temporizador del carrusel
   * @return { void}
   */

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  /**
   * inicia el desplazamiento automático del carrusel
   */

  startAuto() {
    clearInterval(this.timer);
    this.timer = setInterval(() => this.next(), 2000);
  }

  /**
   * cambia la oferta destacada en el carrusel
   */

  next() {
    this.idx = (this.idx + 1) % this.featured.length;
  }

  /**
   * cambia el carrusel a una oferta especifica
   * @param index
   */

  goTo(index: number) {
    this.idx = index;
    this.startAuto();
  }

  /**
   * obtiene la oferta destacada actualmente activa
   */

  active(): Offer | null {
    return this.featured[this.idx] ?? null;
  }

  /**
   * devuelve la url de la imagen correspondiente de una oferta, en caso no haya imagen
   * devuelve una ruta
   * @param o
   */

  imgFor(o: Offer | null): string {
    return !o ? '' : (o.imageUrl ?? `assets/offers/${o.id}.jpg`);
  }

  /**
   * se aplican filtros
   */

  applyFilters() {
    const q = this.filters.q.trim().toLowerCase();

    let list = this.all.filter((o) => {
      const byText =
        !q || [o.title, o.partner, o.category, o.location].some((s) =>
          s.toLowerCase().includes(q)
        );
      const byCat = this.filters.category === 'all' || o.category === this.filters.category;
      const byLoc = this.filters.location === 'all' || o.location === this.filters.location;
      return byText && byCat && byLoc;
    });

    switch (this.filters.sort) {
      case 'priceAsc':  list = list.sort((a, b) => a.price - b.price); break;
      case 'priceDesc': list = list.sort((a, b) => b.price - a.price); break;
      case 'ratingDesc':list = list.sort((a, b) => b.rating - a.rating); break;
      default: break;
    }

    this.filtered = list;

    if (this.dataLoaded) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { q: this.filters.q || null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }

  /**
   * limpia los filtros aplicados
   */

  clearFilters() {
    this.filters = { q: '', category: 'all', location: 'all', sort: 'relevance' };
    this.applyFilters();
  }

  /**
   * obtiene los favoritos del usuario actual desde la API
   * @private
   */

  private fetchFavs() {
    this.http.get<FavoriteRow[]>(`${this.API}/favorites?userId=1`).subscribe({
      next: (rows) => (this.favSet = new Set(rows.map((r) => r.offerId))),
      error: () => this.favSet.clear(),
    });
  }

  /**
   * verifica si una oferta esta marcada como favorita
   * @param id
   */

  isFav(id: number) { return this.favSet.has(id); }

  /**
   * aqui basicamente se actualiza el estado de favorito de una oferta
   * si ya esta marcada, la elimina de favoritos, sino la agrega
   * @param o
   */
  toggleFav(o: Offer) {
    if (this.favSet.has(o.id)) {
      this.http
        .get<FavoriteRow[]>(`${this.API}/favorites?userId=1&offerId=${o.id}`)
        .subscribe((rows) => {
          if (!rows.length) return;
          this.http
            .delete(`${this.API}/favorites/${rows[0].id}`)
            .subscribe(() => this.favSet.delete(o.id));
        });
    } else {
      const row: FavoriteRow = { userId: 1, offerId: o.id, createdAt: new Date().toISOString() };
      this.http.post(`${this.API}/favorites`, row)
        .subscribe(() => this.favSet.add(o.id));
    }
  }
}
