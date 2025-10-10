import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OffersApiEndpoint } from '../../../infrastructure/offers-api-endpoint';
import { FavoritesApiEndpoint } from '../../../infrastructure/favorites-api-endpoint';
import { TranslateModule } from '@ngx-translate/core';
import { CartApi } from '../../../../cart/infrastructure/cart-api';
import { CartUiService } from '../../../../cart/presentation/services/cart-ui.service';
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
  selector: 'app-ofertas',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, RouterLink],
  templateUrl: './ofertas.component.html',
  styleUrls: ['./ofertas.component.css'],
})

/**
 * offers screen
 */
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
   * search filters
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
   * creates an instance of the 'offersComponent' component
   * @param route
   * @param router
   * @param offersApi
   * @param favoritesApi
   * @param authService
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private offersApi: OffersApiEndpoint,
    private favoritesApi: FavoritesApiEndpoint,
    private authService: AuthService
  ) {}

  /**
   * initialize the page
   */
  ngOnInit(): void {

    const user = this.authService.getCurrentUser();
    this.currentUserId = this.authService.getCurrentUserId();
    this.userId = user ? String(user.id) : 'guest';
    if (user) {
      this.userId = String(user.id);
    } else {
      console.warn('[Layout] No hay usuario autenticado');
    }

    this.currentUserId = this.authService.getCurrentUserId();

    if (!this.currentUserId) {
      console.warn('[Ofertas] No hay usuario autenticado');
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
   * checks if a location is a district and should not be translated
   * @param location - location name
   */
  isDistrict(location: string): boolean {
    const districts = [
      'Surco', 'San Miguel', 'San Borja', 'Chorrillos', 'Santa Marina', 'Trujillo',
      'Arequipa', 'Ica', 'Ate', 'Breña', 'Comas', 'Barranco', 'Los Olivos', 'Magdalena',
      'Miraflores', 'Pueblo Libre', 'San Isidro', 'Tiendas seleccionadas'
    ];
    // Divide la ubicación por comas y elimina espacios
    const locationParts = location.split(',').map(part => part.trim());
    // Verifica si alguna parte es un distrito
    return locationParts.some(part => districts.includes(part));
  }

  /**
   * starts the automatic scrolling of the carousel
   */
  startAuto() {
    clearInterval(this.timer);
    this.timer = setInterval(() => this.next(), 2000);
  }

  /**
   * change the featured offer in the carousel
   */
  next() {
    this.idx = (this.idx + 1) % this.featured.length;
  }

  /**
   * change the carousel to a specific offer
   * @param index
   */
  goTo(index: number) {
    this.idx = index;
    this.startAuto();
  }

  /**
   * get the currently active featured offer
   */
  active(): Offer | null {
    return this.featured[this.idx] ?? null;
  }

  /**
   * returns the URL of the corresponding image of an offer, if there is no image
   * @param o
   */
  imgFor(o: Offer | null): string {
    return !o ? '' : (o.imageUrl ?? `assets/offers/${o.id}.jpg`);
  }

  /**
   * filters are applied
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

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.filters.q || null,
        category: this.filters.category !== 'all' ? this.filters.category : null,
        location: this.filters.location !== 'all' ? this.filters.location : null,
        sort: this.filters.sort !== 'relevance' ? this.filters.sort : null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  /**
   * clears the applied filters
   */
  clearFilters() {
    this.filters = { q: '', category: 'all', location: 'all', sort: 'relevance' };
    this.applyFilters();
  }

  /**
   * get the current users favorites from the API
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
      },
      error: () => this.favSet.clear(),
    });
  }

  /**
   * check if an offer is marked as a favorite
   * @param id
   */
  isFav(id: number) { return this.favSet.has(id); }

  /**
   * this basically updates the favorite status of an offer.
   * If its already marked, it removes it from your favorites; if not, it adds it.
   * @param o
   */
  toggleFav(o: Offer) {
    if (!this.currentUserId) {
      alert('Debes iniciar sesión para agregar favoritos');
      return;
    }

    if (this.favSet.has(o.id)) {
      this.favoritesApi.findRow(this.currentUserId, o.id).subscribe((rows) => {
        if (!rows.length) return;
        this.favoritesApi.removeRow(rows[0].id!).subscribe(() => {
          this.favSet.delete(o.id);
        });
      });
    } else {
      this.favoritesApi.add(this.currentUserId, o.id).subscribe(() => {
        this.favSet.add(o.id);
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
