import {Component, inject, OnInit, signal, viewChild} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import { WelcomeBannerComponent } from '../../../../subscriptions/presentation/components/welcome-banner/welcome-banner.component';
import {Offer} from '../../../../loyalty/domain/model/offer.entity';
import {OffersApiEndpoint} from '../../../../loyalty/infrastructure/offers/offers-api-endpoint';
import {DecimalPipe, NgForOf, NgIf} from '@angular/common';
import {FavoritesApiEndpoint} from '../../../../loyalty/infrastructure/favorites/favorites-api-endpoint';
import {CartApi} from '../../../../cart/infrastructure/cart-api';
import {CartUiService} from '../../../../cart/presentation/services/cart-ui.service';
import {AuthService} from '../../../../identity/infrastructure/auth/auth.service';
import {RouterLink} from '@angular/router';
import {GoogleMap, MapAdvancedMarker, MapInfoWindow} from '@angular/google-maps';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [
    TranslatePipe,
    WelcomeBannerComponent,
    DecimalPipe,
    NgForOf,
    RouterLink,
    NgIf,
    GoogleMap,
    FormsModule,
    MapAdvancedMarker,
    MapInfoWindow
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  private favSet = new Set<number>();
  private currentUserId: number | null = null;
  private userId:string = 'a512';
  private readonly cartApi = inject(CartApi);
  private readonly cartUiService = inject(CartUiService);

  categories = [
    { key: 'all', label: 'home.map.all' },
    { key: 'cinemas', label: 'home.map.cinemas' },
    { key: 'buffets', label: 'home.map.buffets' },
    { key: 'parks', label: 'home.map.parks' },
    { key: 'children', label: 'home.map.for-children' },
    { key: 'makis', label: 'home.map.makis' },
    { key: 'beauty', label: 'home.map.beauty' }
  ];
  selectedCategories:string[] = ['all'];
  cinemaOffers:Offer[] = [];
  buffetOffers:Offer[] = [];
  parkOffers:Offer[] = [];
  mechGamesOffers:Offer[] = [];
  makisOffers:Offer[] = [];
  beautyOffers:Offer[] = [];

  latitude = signal<number>(0);
  longitude = signal<number>(0);
  locationAllowed: boolean = false;
  center = signal<google.maps.LatLngLiteral>({lat: this.latitude(), lng: this.longitude()});
  zoomSignal = signal(11);
  locationOffers = signal<{title: string, partner: string, lat: number, lng: number}[]>([]);
  infoWindowRef = viewChild.required(MapInfoWindow);

  constructor(
    private offersApi: OffersApiEndpoint,
    private favoritesApi: FavoritesApiEndpoint,
    private authService: AuthService
  )
  {}

  ngOnInit(): void {

    this.checkPermissionsOnLoad().then();

    const cinemaNumbers = [18, 8, 16];
    const buffetNumbers = [7, 5, 9];
    const parkNumbers = [13, 11, 17];
    const mechGamesNumbers = [20, 10, 1];
    const makisNumbers = [22, 21, 12];
    const beautyNumbers = [15, 2, 3];

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

    this.offersApi.getByIds(cinemaNumbers).subscribe({
      next: (offers) => {
          this.cinemaOffers = offers;
          console.log('Cinema offers: ', this.cinemaOffers);
        },
      error: (err) => {console.error('Error to fetching offers', err)}
    });

    this.offersApi.getByIds(buffetNumbers).subscribe({
      next: (offers) => {
        this.buffetOffers = offers;
        console.log('Buffet offers: ', this.buffetOffers);
      },
      error: (err) => {console.error('Error to fetching offers', err)}
    });

    this.offersApi.getByIds(parkNumbers).subscribe({
      next: (offers) => {
        this.parkOffers = offers;
        console.log('Park offers: ', this.parkOffers);
      },
      error: (err) => {console.error('Error to fetching offers', err)}
    });


    this.offersApi.getByIds(mechGamesNumbers).subscribe({
      next: (offers) => {
        this.mechGamesOffers = offers;
        console.log('Mechanical Games offers: ', this.mechGamesOffers);
      },
      error: (err) => {console.error('Error to fetching offers', err)}
    });

    this.offersApi.getByIds(makisNumbers).subscribe({
      next: (offers) => {
        this.makisOffers = offers;
        console.log('Makis Open Bar offers: ', this.makisOffers);
      },
      error: (err) => {console.error('Error to fetching offers', err)}
    });

    this.offersApi.getByIds(beautyNumbers).subscribe({
      next: (offers) => {
        this.beautyOffers = offers;
        console.log('Beauty offers: ', this.beautyOffers);
      },
      error: (err) => {console.error('Error to fetching offers', err)}
    });

    this.fetchFavs();
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
   * Selects the categories selected in the map filter. If the user selects All, it will only
   * select All category and unselects the other categories.
   * @param catKey - Detects which category was selected and pushes into selectedCategories array.
   */
  selectCategory(catKey: string) {
    if (catKey === 'all') {
      this.selectedCategories = ['all'];
    }
    else {
      this.selectedCategories = this.selectedCategories.filter(c => c !== 'all');
      if (this.selectedCategories.includes(catKey)) {
        this.selectedCategories = this.selectedCategories.filter(c => c !== catKey);
      }
      else {
        this.selectedCategories.push(catKey);
      }
    }
  }

  /**
   * Verifies if the category selected is in the selectedCategories array.
   * @param catKey - The string of the category
   * @returns If the category is in the selectedCategory array.
   */
  isCategoryActive(catKey: string): boolean {
    return this.selectedCategories.includes(catKey);
  }

  /**
   * Function to get the url of the offer image
   * @param o - The offer that might have an image
   * @returns the url of the image, if there is not one, returns an empty string
   */
  imgFor(o: Offer | null): string {
    return !o ? '' : (o.imageUrl ?? `assets/offers/${o.id}.jpg`);
  }

  isFav(id: number) { return this.favSet.has(id); }

  toggleFav(o: Offer) {
    if (!this.currentUserId) {
      console.warn('[Ofertas] You have to log-in to add favorites');
      alert('Debes iniciar sesión para agregar favoritos');
      return;
    }

    if (this.favSet.has(o.id)) {
      this.favoritesApi.findRow(this.currentUserId, o.id).subscribe((rows) => {
        if (!rows.length) return;
        this.favoritesApi.removeRow(rows[0].id!).subscribe(() => {
          this.favSet.delete(o.id);
          console.log('[Ofertas] Favorito eliminado:', o.id);
        });
      });
    } else {
      this.favoritesApi.add(this.currentUserId, o.id).subscribe(() => {
        this.favSet.add(o.id);
        console.log('[Ofertas] Favorito agregado:', o.id);
      });
    }
  }

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
   * @summary
   * Asks the user to get their location
   * Stores the latitude and longitude
   */
  getLocation(isLocationAllowed: boolean = false) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.latitude.set(position.coords.latitude);
        this.longitude.set(position.coords.longitude);
        this.center.set({lat: this.latitude(), lng: this.longitude()});
        console.log('Latitude:', this.latitude());
        console.log('Longitude:', this.longitude());
        console.log('center:', this.center().lat, " ",this.center().lng);
        this.locationAllowed = true;

        if(isLocationAllowed) {
          localStorage.setItem('locationAllowed','true');
        }

        this.offersApi.getAll().subscribe({
          next: (offers) => {
            const baseLat = this.latitude();
            const baseLng = this.longitude();

            this.locationOffers.update(() => {

              return offers.map(o => {
                const coords = this.generateNearbyLocation(baseLat, baseLng, 3.5);
                return {
                  title: o.title ?? "No title",
                  partner: o.partner ?? "No Partner",
                  lat: coords.lat,
                  lng: coords.lng
                };
              });
            });

            console.log("Offers with random locations:", this.locationOffers());
          },

          error: (err) => {
            console.error(err);
          }
        });

      },
      (error) => {
        console.log('Error getting location:', error.message);
      }
    )
  }

  /**
   * @summary Checks if geolocation was previously accepted
   */
  async checkPermissionsOnLoad() {
    const wasAllowed = localStorage.getItem('locationAllowed') === 'true';

    const permission = await navigator.permissions.query({name: 'geolocation'});

    if(permission.state === 'granted' && wasAllowed) {
      console.log('Geolocation permission previously allowed');
      this.getLocation();
    }
  }

  /**
   * @summary Generates a location using Harvesine Formula
   * @param baseLat The user's latitude
   * @param baseLng The user's longitude
   * @param maxDistanceKm The maximum radius distance in kilometers
   */
  generateNearbyLocation(baseLat: number, baseLng: number, maxDistanceKm: number) {
    // Bounding box de Lima Metropolitana
    const minLat = -12.35;
    const maxLat = -11.75;
    const minLng = -77.20;
    const maxLng = -76.80;

    // 1 grado ≈ 111 km
    const kmToDeg = 1 / 111;

    // radio aleatorio (entre 0 km y max km)
    const randomDistKm = Math.random() * maxDistanceKm;
    const randomDistDeg = randomDistKm * kmToDeg;

    // dirección aleatoria
    const angle = Math.random() * 2 * Math.PI;

    // Nueva lat/lng generada alrededor de la base
    let newLat = baseLat + randomDistDeg * Math.cos(angle);
    let newLng = baseLng + randomDistDeg * Math.sin(angle);

    // Si se sale de Lima, lo reencerramos dentro del bounding box
    if (newLat < minLat) newLat = minLat;
    if (newLat > maxLat) newLat = maxLat;
    if (newLng < minLng) newLng = minLng;
    if (newLng > maxLng) newLng = maxLng;

    return { lat: newLat, lng: newLng };
  }

  openInfoWindow(location:{title: string, partner: string, lat: number, lng: number}, marker: MapAdvancedMarker) {
    console.log("Offer title:", location.title, "Offer partner:",location.partner);
    const content = `
      <h2>${location.title}</h2>
      <p>${location.partner}</p>
    `
    this.infoWindowRef().open(marker,true, content);
  }
}
