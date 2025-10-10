import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
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
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcher } from '../language-switcher/language-switcher';

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
    LanguageSwitcher
  ],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class Layout {
  q = '';
  userName = 'Ariana';

  get userInitial() {
    const n = this.userName?.trim();
    return n ? n[0].toUpperCase() : '?';
  }

  doSearch() {
    const term = this.q.trim();
    console.log('[Layout] Buscar:', term);
  }

  onGlobalSearch(term: string) {
    console.log('Buscar:', term);
  }

  constructor(private router: Router) {}

  goToHelpCenter() {
    this.router.navigate(['/help/help-center']);
  }

  options = [
    { link: '/home',        label: 'option.home' },
    { link: '/ofertas',     label: 'option.offers' },
    { link: '/categorias',  label: 'option.categories' },
    { link: '/favoritos',   label: 'option.favorites' },
    { link: '/mis-cupones', label: 'option.mycoupons' },
  ];
}
