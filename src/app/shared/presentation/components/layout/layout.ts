import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import {Router, RouterLink, RouterOutlet} from '@angular/router';
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
import {AuthService} from '../../../../loyalty/infrastructure/auth/auth.service';
import {CommonModule} from '@angular/common';

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
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout implements OnInit {
  private readonly cartApi = inject(CartApi);
  private readonly cartUiService = inject(CartUiService);

  @ViewChild(CartSidebarComponent) cartSidebar!: CartSidebarComponent;

  q = '';
  userName = 'Usuario';
  cartCount = signal(0);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.name;
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
    }
  }

  onLogout() {
    console.log('[Layout] Cerrando sesión');
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  options = [
    { link: '/home',        label: 'option.home' },
    { link: '/ofertas',     label: 'option.offers' },
    { link: '/categorias',  label: 'option.categories' },
    { link: '/favoritos',   label: 'option.favorites' },
    { link: '/mis-cupones', label: 'option.mycoupons' },
  ];
}
