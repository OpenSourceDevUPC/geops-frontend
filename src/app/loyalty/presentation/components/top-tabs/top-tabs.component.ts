import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-top-tabs',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslateModule],
  template: `
    <nav class="tabs-wrap" aria-label="Navegación principal">
      <a class="tab"
         routerLink="/home"
         routerLinkActive="active"
         [routerLinkActiveOptions]="{exact:true}">
        {{ 'option.home' | translate }}
      </a>

      <a class="tab"
         routerLink="/ofertas"
         routerLinkActive="active"
         [routerLinkActiveOptions]="{exact:true}">
        {{ 'option.offers' | translate }}
      </a>

      <a class="tab"
         routerLink="/categorias"
         routerLinkActive="active"
         [routerLinkActiveOptions]="{exact:true}">
        {{ 'option.categories' | translate }}
      </a>

      <a class="tab"
         routerLink="/favoritos"
         routerLinkActive="active"
         [routerLinkActiveOptions]="{exact:true}">
        {{ 'option.favorites' | translate }}
      </a>

      <a class="tab"
         routerLink="/mis-cupones"
         routerLinkActive="active"
         [routerLinkActiveOptions]="{exact:true}">
        {{ 'option.coupons' | translate }}
      </a>
    </nav>
  `,
  styles: [`
    .tabs-wrap{
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 24px;
      align-items: center;
      max-width: 880px;
      margin: 12px auto 20px;
      padding: 10px 14px;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      background: #fff;
    }

    .tab{
      justify-self: center;
      text-decoration: none;
      color: #111827;
      font-weight: 600;
      padding: 8px 16px;
      border-radius: 12px;
      transition: background .15s, color .15s;
      white-space: nowrap;
    }

    .tab:hover{
      background: #000;
      color: #fff;
    }

    .tab.active{
      background: #000;
      color: #fff;
    }
  `]
})
export class TopTabsComponent {}
