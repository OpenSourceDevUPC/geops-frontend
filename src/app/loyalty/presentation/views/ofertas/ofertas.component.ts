  import { Component, OnDestroy, OnInit } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { FormsModule } from '@angular/forms';
  import {ActivatedRoute, Router, RouterLink} from '@angular/router';
  import { OffersApiEndpoint } from '../../../infrastructure/offers-api-endpoint';
  import { FavoritesApiEndpoint } from '../../../infrastructure/favorites-api-endpoint';
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
    selector: 'app-ofertas',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule, RouterLink  ],
    templateUrl: './ofertas.component.html',
    styleUrls: ['./ofertas.component.css'],
  })

  export class OfertasComponent implements OnInit, OnDestroy {

    loading = false;
    all: Offer[] = [];
    featured: Offer[] = [];
    filtered: Offer[] = [];

    categories: string[] = [];
    locations: string[] = [];

    idx = 0;
    timer?: any;

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

      this.currentUserId = this.authService.getCurrentUserId();
      console.log('[Ofertas] Usuario actual ID:', this.currentUserId);

      if (!this.currentUserId) {
        console.warn('[Ofertas] No hay usuario autenticado');
      }

      this.loading = true;

      /*change to maintain the filters*/
      this.route.queryParamMap.subscribe(params => {
        this.filters.q        = params.get('q') ?? '';
        this.filters.category = (params.get('category') ?? 'all') as any;
        this.filters.location = (params.get('location') ?? 'all') as any;
        this.filters.sort     = (params.get('sort') ?? 'relevance') as any;

        if (this.dataLoaded) this.applyFilters(); // evita aplicar antes de tener data
      });

      /* load of offers */
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
     * cleans up resources by destroying the component
     * stop the carousel
     * @return { void}
     */
    ngOnDestroy(): void {
      clearInterval(this.timer);
    }

    /**
     * Starts automatic carousel scrolling
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
     * jump the carousel to a specific index
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
     * returns the URL of an offer's image
     * @param o - offer or null
     */
    imgFor(o: Offer | null): string {
      return !o ? '' : (o.imageUrl ?? `assets/offers/${o.id}.jpg`);
    }

    /**
     * apply current filters and sorting to the offer list
     * and sync query params to the URL
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

      /*Reflects filters in the URL */
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
     * clear all applied filters
     */
    clearFilters() {
      this.filters = { q: '', category: 'all', location: 'all', sort: 'relevance' };
      this.applyFilters();
    }

    /**
     * get the current user's favorites from the API
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
     * @param id - offerID
     */
    isFav(id: number) { return this.favSet.has(id); }

    /**
     * this basically updates the favorite status of an offer
     * if it's already marked, it removes it from your favorites; if not, it adds it.
     * @param o - offer to be checked/unchecked
     */
    toggleFav(o: Offer) {
      if (!this.currentUserId) {
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
  }
