import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import {Router, RouterLink, RouterOutlet, NavigationStart, NavigationEnd, NavigationCancel, NavigationError} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { FooterContent } from '../footer-content/footer-content';
import { TopTabsComponent } from '../../../../loyalty/presentation/components/top-tabs/top-tabs.component';
import {TranslateModule} from '@ngx-translate/core';
import {LanguageSwitcher} from '../language-switcher/language-switcher';
import { CartSidebarComponent } from '../../../../cart/presentation/components/cart-sidebar/cart-sidebar.component';
import { CartApi } from '../../../../cart/infrastructure/cart-api';
import { CartUiService } from '../../../../cart/presentation/services/cart-ui.service';
import {AuthService} from '../../../../identity/infrastructure/auth/auth.service';
import {CommonModule} from '@angular/common';
import { NavigationLoadingService } from '../../services/navigation-loading.service';
import { NavigationBackdropComponent } from '../navigation-backdrop/navigation-backdrop.component';
import { NotificationsDropdownComponent } from '../../../../notifications/presentation/components/notifications-dropdown/notifications-dropdown.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    MatDividerModule,
    FooterContent,
    TopTabsComponent,
    TranslateModule,
    LanguageSwitcher,
    CartSidebarComponent,
    CommonModule,
    NavigationBackdropComponent,
    NotificationsDropdownComponent,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout implements OnInit {
  private readonly cartApi = inject(CartApi);
  private readonly cartUiService = inject(CartUiService);
  private readonly navigationLoadingService = inject(NavigationLoadingService);

  @ViewChild(CartSidebarComponent) cartSidebar!: CartSidebarComponent;

  q = '';
  userName = 'Usuario';
  userEmail = 'usuario@geops.com';
  cartCount = signal(0);
  isMobileMenuOpen = signal(false);
  isSearchFocused = signal(false);

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    // Listen to navigation events to show/hide backdrop
    this.router.events.pipe(
      filter(event =>
        event instanceof NavigationStart ||
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      )
    ).subscribe(event => {
      if (event instanceof NavigationStart) {
        // Show backdrop when navigation starts
        this.navigationLoadingService.showBackdrop();
      } else {
        // Hide backdrop when navigation ends, is cancelled, or errors
        setTimeout(() => {
          this.navigationLoadingService.hideBackdrop();
        }, 300); // Small delay to ensure smooth transition
      }
    });
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.name;
      this.userEmail = user.email || 'usuario@geops.com';
      console.log('[Layout] Usuario actual:', this.userName, 'ID:', user.id);
    } else {
      console.warn('[Layout] No hay usuario autenticado');
    }
        // Subscribe to cart count changes
    this.cartApi.getCartCount().subscribe(count => {
      this.cartCount.set(count);
    });

    // Subscribe to cart open requests
    this.cartUiService.openCart$.subscribe(() => {
      this.openCart();
    });
  }

  get userInitial() {
    const n = this.userName?.trim();
    return n ? n[0].toUpperCase() : '?';
  }

  /**
   * Open cart sidebar
   */
  openCart() {
    this.cartSidebar.open();
  }

  doSearch() {
    const term = this.q.trim();
    if (term) {
      console.log('[Layout] Buscar:', term);
      this.router.navigate(['/ofertas'], { queryParams: { q: term } });
      this.isSearchFocused.set(false);
      this.closeMobileMenu();
    }
  }

  clearSearch() {
    this.q = '';
    this.router.navigate(['/ofertas']);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(value => !value);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  onSearchFocus() {
    this.isSearchFocused.set(true);
  }

  onSearchBlur() {
    setTimeout(() => this.isSearchFocused.set(false), 200);
  }

  onLogout() {
    console.log('[Layout] Cerrando sesión');
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  options = [
    { link: '/home',        label: 'option.home' },
    { link: '/ofertas',     label: 'option.offers' },
    { link: '/categories',  label: 'option.categories' },
    { link: '/favoritos',   label: 'option.favorites' },
    { link: '/mis-cupones', label: 'option.mycoupons' },
  ];
}
