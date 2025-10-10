import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
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
    CartSidebarComponent
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout implements OnInit {
  private readonly cartApi = inject(CartApi);

  @ViewChild(CartSidebarComponent) cartSidebar!: CartSidebarComponent;

  q = '';
  userName = 'Ariana';
  cartCount = signal(0);

  ngOnInit() {
    // Subscribe to cart count changes
    this.cartApi.getCartCount().subscribe(count => {
      this.cartCount.set(count);
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
    console.log('[Layout] Buscar:', term);
  }

  onGlobalSearch(term: string) {
    console.log('Buscar:', term);
  }

  options = [
    { link: '/home',        label: 'option.home' },
    { link: '/ofertas',     label: 'option.offers' },
    { link: '/categorias',  label: 'option.categories' },
    { link: '/favoritos',   label: 'option.favorites' },
    { link: '/mis-cupones', label: 'option.mycoupons' },
  ];
}
