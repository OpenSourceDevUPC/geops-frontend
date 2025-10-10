import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OffersApiEndpoint } from '../../../infrastructure/offers/offers-api-endpoint';
import { FavoritesApiEndpoint } from '../../../infrastructure/favorites/favorites-api-endpoint';
import { TranslateModule } from '@ngx-translate/core';
import { CartApi } from '../../../../cart/infrastructure/cart-api';
import { CartUiService } from '../../../../cart/presentation/services/cart-ui.service';
import {AuthService} from '../../../../identity/infrastructure/auth/auth.service';

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
  selector: 'app-ofertas',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './ofertas.component.html',
  styleUrls: ['./ofertas.component.css'],
})

export class OfertasComponent implements OnInit, OnDestroy {

  private readonly cartApi = inject(CartApi);
  private readonly cartUiService = inject(CartUiService);

  loading = false;
  all: Offer[] = [];
  featured: Offer[] = [];
  filtered: Offer[] = [];

  categories: string[] = [];
  locations: string[] = [];

  idx = 0;
  timer?: any;
  userId = 'a512';

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
  private currentUserId: number | null = null;

  /**
   * crea una instancia del componente ofertascomponent
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private offersApi: OffersApiEndpoint,
    private favoritesApi: FavoritesApiEndpoint,
    private authService: AuthService
  ) {}

  /**
   * obtiene las ofertas de la API
   * carga todo lo que tiene que tener ofertas
   * inicia el carrusel de las ofertas destacadas
   * recupera los favoritos del usuario
   */
  ngOnInit(): void {

    const user = this.authService.getCurrentUser();
    if (user) {
      this.userId = String(user.id);
    } else {
      console.warn('[Layout] No hay usuario autenticado');
    }

    this.currentUserId = this.authService.getCurrentUserId();
    console.log('[Ofertas] Usuario actual ID:', this.currentUserId);

    if (!this.currentUserId) {
      console.warn('[Ofertas] No hay usuario autenticado');
      // Opcional: redirigir al login
      // this.router.navigate(['/login']);
    }

    this.loading = true;

    this.offersApi.getAll().subscribe({
      next: (offers) => {
        const order = [14, 8, 18, 21];
        this.all = offers as Offer[];
        this.featured = order
          .map((id) => this.all.find((o) => o.id === id))
          .filter((o): o is Offer => !!o);

        this.categories = Array.from(new Set(this.all.map((o) => o.category))).sort();
        this.locations = Array.from(new Set(this.all.map((o) => o.location))).sort();

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
    if (!this.currentUserId) {
      this.favSet.clear();
      return;
    }
    this.favoritesApi.getByUser(this.currentUserId).subscribe({
      next: (rows) => {
        this.favSet = new Set(rows.map((r) => r.offerId));
        console.log('[Ofertas] Favoritos cargados:', this.favSet.size);
      },
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
    if (!this.currentUserId) {
      console.warn('[Ofertas] Debes iniciar sesión para agregar favoritos');
      alert('Debes iniciar sesión para agregar favoritos');
      return;
    }

    if (this.favSet.has(o.id)) {
      // REMOVER favorito
      this.favoritesApi.findRow(this.currentUserId, o.id).subscribe((rows) => {
        if (!rows.length) return;
        this.favoritesApi.removeRow(rows[0].id!).subscribe(() => {
          this.favSet.delete(o.id);
          console.log('[Ofertas] Favorito eliminado:', o.id);
        });
      });
    } else {
      // AGREGAR favorito
      this.favoritesApi.add(this.currentUserId, o.id).subscribe(() => {
        this.favSet.add(o.id);
        console.log('[Ofertas] Favorito agregado:', o.id);
      });
    }
  }

  /**
   * Añade una oferta al carrito
   * @param o - Oferta a añadir
   */
  addToCart(o: Offer) {
    const offerTitle = o.title;
    const offerImageUrl = this.imgFor(o);

    this.cartApi.addItemToCart(
      this.userId,
      o.id.toString(),
      offerTitle,
      o.price,
      offerImageUrl,
      1
    ).subscribe({
      next: () => {
        // Reset payment flow when items are added
        this.cartUiService.resetPaymentFlow();
        // Could show a success message here
        console.log('Item added to cart successfully');
      },
      error: (error) => {
        console.error('Error adding item to cart:', error);
        // Could show an error message here
      }
    });
  }

  /**
   * Procede a comprar directamente - añade al carrito y abre el sidebar
   * @param o - Oferta a comprar
   */
  buyNow(o: Offer) {
    // Using hardcoded user ID for now - in real app would come from auth service
    const offerTitle = o.title;
    const offerImageUrl = this.imgFor(o);

    // Add to cart first, then open cart sidebar
    this.cartApi
      .addItemToCart(this.userId, o.id.toString(), offerTitle, o.price, offerImageUrl, 1)
      .subscribe({
        next: () => {
          console.log('Item added to cart successfully');
          // Reset payment flow when items are added
          this.cartUiService.resetPaymentFlow();
          // Open the cart sidebar after adding the item
          this.cartUiService.openCart();
        },
        error: (error) => {
          console.error('Error adding item to cart:', error);
          // Could show an error message here
        },
      });
  }
}
